export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://bdov54.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};

    const generateOrderId = () => {
      return "NP-" + Date.now();
    };

    let customerTaste = body.customer_taste || "";
    if (Array.isArray(customerTaste)) {
      customerTaste = customerTaste.join(", ");
    }

    const knackPayload = {
      field_17: body.lastname || "",                 // Last Name = Tên
      field_18: generateOrderId(),                  // Order ID
      field_19: body.firstname || "",               // First Name = Họ
      field_20: Number(body.order_total || 0),      // Order Total
      field_22: "New",                              // Status
      field_23: body.email || "",                   // Email
      field_24: body.phone || "",                   // Phone
      field_25: Number(body.order_item_count || 0), // Order Item Count
      field_26: body.address || "",                 // Address
      field_27: body.order_summary || "",           // Order Summary
      field_28: "HubSpot Sale Page",                // Source
      field_29: body.email || "",                   // Hubspot Contact Email
      field_33: customerTaste,                      // CustomerTaste
      field_34: voucher_code || ""                            // Voucher Code
    };

    const response = await fetch(
      `https://api.knack.com/v1/objects/YOUR_KNACK_OBJECT_KEY/records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Knack-Application-Id": process.env.KNACK_APP_ID,
          "X-Knack-REST-API-Key": process.env.KNACK_API_KEY
        },
        body: JSON.stringify(knackPayload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: "Knack create record failed",
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      record: data
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unknown server error"
    });
  }
}