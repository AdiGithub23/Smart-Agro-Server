'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Messages', 'Messages_receiverId_fkey');
    await queryInterface.removeConstraint('Messages', 'Messages_senderId_fkey');

    await queryInterface.addConstraint('Messages', {
      fields: ['receiverId'],
      type: 'foreign key',
      name: 'Messages_receiverId_fkey',
      references: {
        table: 'Users',
        field: 'id',
      },
      onDelete: 'CASCADE',  // Add cascade on delete
    });

    await queryInterface.addConstraint('Messages', {
      fields: ['senderId'],
      type: 'foreign key',
      name: 'Messages_senderId_fkey',
      references: {
        table: 'Users',
        field: 'id',
      },
      onDelete: 'CASCADE',  // Add cascade on delete
    });
  },

  down: async (queryInterface, Sequelize) => {
    // In the down method, you should remove these constraints if needed.
    await queryInterface.removeConstraint('Messages', 'Messages_receiverId_fkey');
    await queryInterface.removeConstraint('Messages', 'Messages_senderId_fkey');
    
    // Add the original constraints back without cascade.
    await queryInterface.addConstraint('Messages', {
      fields: ['receiverId'],
      type: 'foreign key',
      name: 'Messages_receiverId_fkey',
      references: {
        table: 'Users',
        field: 'id',
      },
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('Messages', {
      fields: ['senderId'],
      type: 'foreign key',
      name: 'Messages_senderId_fkey',
      references: {
        table: 'Users',
        field: 'id',
      },
      onDelete: 'NO ACTION',
    });
  }
};
