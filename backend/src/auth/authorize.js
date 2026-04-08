export function authorize(required = []) {
  return (req, res, next) => {
    if (!required.length) return next();
    const have = req.user?.roles || [];
    const ok = have.some(r => required.includes(r));
    if (!ok) return res.status(403).json({ error: "Forbidden: insufficient role" });
    next();
  };
}
