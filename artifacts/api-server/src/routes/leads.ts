import { Router, type IRouter } from "express";
import { CreateLeadBody } from "@workspace/api-zod";
import { appendLeadToSheet } from "../lib/google-sheets";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/leads", async (req, res) => {
  try {
    const parsed = CreateLeadBody.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Please review the form fields and try again.",
        issues: parsed.error.flatten(),
      });
      return;
    }

    const payload = parsed.data;

    if (!payload.consent) {
      res.status(400).json({ message: "Consent is required." });
      return;
    }

    await appendLeadToSheet(payload);

    res.status(201).json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not configured")) {
      logger.error({ err: error }, "Google Sheets is not configured");
      res.status(503).json({
        message: "Lead capture is temporarily unavailable. Please try WhatsApp instead.",
      });
      return;
    }

    logger.error({ err: error }, "Failed to save lead");
    res.status(502).json({
      message: "We could not save your request right now. Please try again in a moment.",
    });
  }
});

export default router;