Anti Septic Tank, [17/02/2024 19:39]
const { Telegraf } = require('telegraf');
const fs = require('fs');

const bot = new Telegraf('6977694763:AAEwD14P0CYTEL_VFCJzkjuqercw3-qbAh8);
const password = 'coupfam';
let companies = {};

// Load companies from JSON file on bot startup
fs.readFile('companies.json', (err, data) => {
    if (err) {
        console.error('Error reading companies file:', err);
    } else {
        try {
            companies = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing companies JSON:', parseError);
        }
    }
});

// Save companies to JSON file
function saveCompanies() {
    fs.writeFile('companies.json', JSON.stringify(companies, null, 2), (err) => {
        if (err) {
            console.error('Error saving companies file:', err);
        }
    });
}

// Command to add a company
bot.command('add', (ctx) => {
    const userId = ctx.from.id;
    const company = ctx.message.text.split(' ').slice(1).join(' ');

    if (!company) {
        return ctx.reply('Please provide a company name.');
    }

    companies[company] = { coupons: [] };

    ctx.reply('Does the company have a coupon? (Yes/No)');
    ctx.session = { company };
});

bot.hears(/^(yes|no)$/i, (ctx) => {
    const response = ctx.message.text.toLowerCase();
    const { company } = ctx.session;

    if (response === 'yes') {
        ctx.reply('Please provide the value in the format £5.00');
        ctx.session.hasCoupon = true;
    } else {
        ctx.reply('Company added without a coupon.');
        saveCompanies(); // Save companies to JSON file
        delete ctx.session;
    }
});

bot.hears(/^\£(\d+(\.\d{1,2})?)$/, (ctx) => {
    const value = ctx.match[0];
    const { company, hasCoupon } = ctx.session;

    if (!hasCoupon) {
        return ctx.reply('Invalid command.');
    }

    ctx.reply('Please send a photo of the coupon.');
    companies[company].coupons.push({ value, photo: null });
});

bot.on('photo', (ctx) => {
    const photo = ctx.message.photo[0].file_id;
    const { company } = ctx.session;

    companies[company].coupons[companies[company].coupons.length - 1].photo = photo;
    
    saveCompanies(); // Save companies to JSON file
    ctx.reply('Coupon added successfully!');
    delete ctx.session;
});

// Command to search for a company
bot.command('search', (ctx) => {
    const searchTerm = ctx.message.text.split(' ').slice(1).join(' ');
    const company = companies[searchTerm];

    if (company) {
        const coupons = company.coupons.map((coupon) => `${coupon.value}: ${coupon.photo || 'No photo'}`);
        ctx.reply(`Coupons for ${searchTerm}:\n${coupons.join('\n')}`);
    } else {
        ctx.reply('Company not found.');
    }
});

// Command to list all companies
bot.command('list', (ctx) => {
    const companyNames = Object.keys(companies);
    if (companyNames.length === 0) {
        ctx.reply('No companies added yet.');
    } else {
        ctx.reply('List of companies:\n' + companyNames.join('\n'));
    }
});

// Command to delete a company
bot.command('delete', (ctx) => {
    const companyName = ctx.message.text.split(' ').slice(1).join(' ');
    if (!companyName) {
        return ctx.reply('Please provide a company name to delete.');
    }

    if (companies[companyName]) {
        delete companies[companyName];
        saveCompanies(); // Save companies to JSON file
        ctx.reply(`Company ${companyName} deleted successfully.`);
    } else {
        ctx.reply('Company not found.');
    }
});

// Command to modify a company
bot.command('modify', (ctx) => {
    const companyName = ctx.message.text.split(' ').slice(1).join(' ');
    if (!companyName) {
        return ctx.reply('Please provide a company name to modify.');
    }

    const company = companies[companyName];
    if (!company) {
        return ctx.reply('Company not found.');
    }

    ctx.reply(`What would you like to modify for ${companyName}? (coupons)`);
    ctx.session = { company, companyName };
});

bot.hears(/^(coupons)$/i, (ctx) => {
    const { company, companyName } = ctx.session;

    ctx.

Anti Septic Tank, [17/02/2024 19:39]
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
