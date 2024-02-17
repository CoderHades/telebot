reply(`Current coupons for ${companyName}:\n${company.coupons.map(coupon => `${coupon.value}: ${coupon.photo || 'No photo'}`).join('\n')}`);
    ctx.reply('Please provide the new coupon details in the same format as before.');
});

bot.on('text', (ctx) => {
    const { company, companyName } = ctx.session;

    if (company) {
        const text = ctx.message.text;
        const match = text.match(/^\£(\d+(\.\d{1,2})?)$/);
        if (match) {
            const value = match[0];
            company.coupons.push({ value, photo: null });
            saveCompanies(); // Save companies to JSON file
            ctx.reply('Coupon added successfully!');
        } else {
            ctx.reply('Invalid coupon format. Please provide the value in the format £5.00.');
        }
    }
    delete ctx.session;
});

// Middleware to check password for privileged commands
bot.use((ctx, next) => {
    if (ctx.message.text === password) {
        ctx.session.authenticated = true;
        ctx.reply('Authentication successful. You can now execute privileged commands.');
    } else if (ctx.session.authenticated) {
        next();
    } else {
        ctx.reply('Invalid password.');
    }
});

// Start command
bot.start((ctx) => ctx.reply('Welcome to the Coupon Bot!'));

bot.launch();
