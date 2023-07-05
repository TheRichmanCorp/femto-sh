import { Request, onRequest } from "firebase-functions/v2/https"
import { Response } from "firebase-functions/v1"
import { getLogger } from "./utils/logging"

import type { LoggingMetadata } from "./utils/logging"


export const messengerWebhook = onRequest(async (req, res) => {
  switch (req.method) {
    case "GET":
      verifySubscription(req, res)
      break
    case "POST":
      // webhookImpl(req, res)
      break
  }
})

// Messenger Verify Webhook Subscription
const verifySubscription = (req: Request, res: Response<any>) => {
  const metadata: LoggingMetadata = { service: "webhook-verify" }
  const logger = getLogger(metadata)

  logger.info("[{service}] Incoming webhook verification request")
  const verifyToken = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN ?? ""

  // Verify token not exist, abort request
  if (verifyToken === "") {
    logger.error("VERIFY_TOKEN not exists")
    res.status(405).send("VERIFY_TOKEN not set").end()
    return
  }

  // Verify Facebook Webhook Subscriptions
  if (req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === verifyToken) {
    logger.info("Successfully validating webhook token")
    res.status(200).send(req.query["hub.challenge"])
  } else {
    logger.error("Failed validation. Make sure the validation tokens match.")
    res.sendStatus(403)
  }
  logger.close()
}
