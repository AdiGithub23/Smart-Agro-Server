const { User } = require('../models');
const bcrypt = require('bcryptjs');

const createDefaultSuperAdmin = async () => {
  try {
    const existingSuperAdmin = await User.findOne({ where: { user_role: 'super-admin' } });
    if (existingSuperAdmin) {
      console.log('Super-admin user already exists.');
      return;
    }
    const hashedPassword = await bcrypt.hash('123456789aaa', 10);

    await User.create({
      full_name: 'Bruce Wayne',
      address: 'Gothum Street, USA',
      email: 'superadmin@gmail.com',    // Password: DarkKnight
      password: hashedPassword,
      phone_number: '0101010101',
      user_role: 'super-admin',
      company: 'Wayne Enterprices',
      profile_picture: 'N/A',
    });

    console.log('Default super-admin user created.');
  } catch (error) {
    console.error('Error creating super-admin user:', error);
  }
};

createDefaultSuperAdmin();