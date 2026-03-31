exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  try {
    const body = JSON.parse(event.body || "{}");

    if (safeString(body.website)) {
      return jsonResponse(200, { message: "RSVP received." });
    }

    const guestName = safeString(body.guestName, 120);
    const email = safeString(body.email, 160).toLowerCase();
    const phone = safeString(body.phone, 40);
    const attending = safeString(body.attending, 3);
    const message = safeString(body.message, 1500);
    const dietaryNotes = safeString(body.dietaryNotes, 1000);
    const accommodationAssistance = safeString(body.accommodationAssistance, 1000);

    let numberOfAdults = toNonNegativeInt(body.numberOfAdults);
    let numberOfChildren = toNonNegativeInt(body.numberOfChildren);

    if (!guestName || !email || !phone || !attending || !message) {
      return jsonResponse(400, { error: "Missing required fields." });
    }

    if (!["yes", "no"].includes(attending)) {
      return jsonResponse(400, { error: "Invalid attending value." });
    }

    if (attending === "no") {
      numberOfAdults = 0;
      numberOfChildren = 0;
    }

    if (attending === "yes" && numberOfAdults + numberOfChildren < 1) {
      return jsonResponse(400, {
        error: "At least one attendee must be specified if attending."
      });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const formspreeFormId = process.env.FORMSPREE_FORM_ID;
    const publicSiteUrl = process.env.PUBLIC_SITE_URL || "https://olatunjiayo.com";
    const eventName =
      process.env.RSVP_EVENT_NAME ||
      "The ONE-derland: Welcome to BIG SOPHIA first birthday party";

    if (!supabaseUrl || !supabaseServiceRole || !formspreeFormId) {
      return jsonResponse(500, {
        error: "Missing server environment variables."
      });
    }

    const row = {
      guest_name: guestName,
      email,
      phone,
      attending,
      number_of_adults: numberOfAdults,
      number_of_children: numberOfChildren,
      dietary_notes: attending === "yes" ? dietaryNotes : "",
      accommodation_assistance: attending === "yes" ? accommodationAssistance : "",
      message,
      source: "netlify",
      formspree_notified: false,
      netlify_site_url: publicSiteUrl
    };

    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/rsvps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseServiceRole,
        "Authorization": `Bearer ${supabaseServiceRole}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify([row])
    });

    const dbPayloadText = await dbResponse.text();
    let dbPayload;

    try {
      dbPayload = JSON.parse(dbPayloadText);
    } catch {
      dbPayload = dbPayloadText;
    }

    if (!dbResponse.ok) {
      return jsonResponse(500, {
        error: "Database insert failed.",
        detail: dbPayload
      });
    }

    const saved = Array.isArray(dbPayload) ? dbPayload[0] : null;

    let formspreeNotified = false;

    const formspreeBody = new URLSearchParams({
      event_name: eventName,
      guest_name: guestName,
      email,
      _replyto: email,
      phone,
      attending,
      number_of_adults: String(numberOfAdults),
      number_of_children: String(numberOfChildren),
      dietary_notes: attending === "yes" ? dietaryNotes : "",
      accommodation_assistance: attending === "yes" ? accommodationAssistance : "",
      message,
      supabase_id: saved?.id || "",
      created_at: saved?.created_at || "",
      _subject: `New RSVP from ${guestName}`,
      _next: `${publicSiteUrl}/thank-you.html`
    });

    const formspreeResponse = await fetch(`https://formspree.io/f/${formspreeFormId}`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formspreeBody.toString()
    });

    if (formspreeResponse.ok) {
      formspreeNotified = true;

      if (saved?.id) {
        await fetch(`${supabaseUrl}/rest/v1/rsvps?id=eq.${encodeURIComponent(saved.id)}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseServiceRole,
            "Authorization": `Bearer ${supabaseServiceRole}`
          },
          body: JSON.stringify({
            formspree_notified: true
          })
        });
      }
    }

    return jsonResponse(200, {
      id: saved?.id || null,
      formspreeNotified,
      message: "RSVP submitted successfully."
    });
  } catch (error) {
    return jsonResponse(500, {
      error: "Server error.",
      detail: error.message || String(error)
    });
  }
};

function safeString(value, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

function toNonNegativeInt(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(payload)
  };
}
