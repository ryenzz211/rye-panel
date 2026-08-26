export default {
  name: 'message',
  
  async execute(ctx) {
    // Default message handler
    const { from, sock, message } = ctx;
    console.log(`💬 Message from ${from}`);
  }
};
