export function requireActiveRoleIn(required = []) {
  return (req, res, next) => {
    const active = req.get("X-Active-Role");
    const owned = req.user?.roles || [];

    if (!active) {
      return res.status(400).json({ error: "Active role header (X-Active-Role) is required" });
    }
    if (!owned.includes(active)) {
      return res.status(403).json({ error: "Forbidden: you don't have the selected role" });
    }
    if (required.length && !required.includes(active)) {
      return res.status(403).json({ error: "Forbidden: selected role not allowed for this endpoint" });
    }

    req.user.activeRole = active;
    next();
  };
}
