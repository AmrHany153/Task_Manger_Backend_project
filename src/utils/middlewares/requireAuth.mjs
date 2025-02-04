
export const requireAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    
    res.sendStatus(401);
}