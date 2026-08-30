export const globalLogger = (req,res,next)=>{
    console.log(`${req.method} ${req.url}`);
    next();
}