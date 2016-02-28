const mochaIt = GLOBAL.it;
module.exports = GLOBAL.it = (desc, asyncFn) => {

  mochaIt(desc, async (done) => {
    const result = asyncFn(done);
    if (result.then) {
      try {
        await result;
        done();
      } catch (e) {
        done(e);
      }
    }
  });
};
