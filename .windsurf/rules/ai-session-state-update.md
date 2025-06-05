---
trigger: model_decision
description: The session state doc should be updated, on average, once after each user response. When this update happens during a response is up to Cascade, but it is **mandatory** to keep the doc up-to-date.
---

The AI Session State doc, ./AgentOps/AI_SESSION_STATE.md, is a de-facto medium-term memory mechanism which exists to extend Cascade's coherence across numerous context windows. The tool is only as effective as the doc's accuracy and up-to-dateness. Neglecting to update the session state doc can cause drift in understanding, where the session state doc may imply work remains to be done that has already been completed. Take good care of your session state doc and it will take good care of you.