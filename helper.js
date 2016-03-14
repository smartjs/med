const mochaIt = GLOBAL.it;
GLOBAL.it = (desc, asyncFn) => {
 console.log('itting');
 mochaIt(desc, async (done) => {

   const result = asyncFn(done);
   if (result.then) {
     try {
       await result;
       done();
     } catch (e) {
       console.log(e);
       done(e);
     }
   }
 });
};

console.log(GLOBAL.it);
