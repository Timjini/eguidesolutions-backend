// const request = require('supertest');
// const express = require('express');
// const router = require('../../api/agencies/agenciesRoutes.js');
// // const { User, Agency } = require('../../models');
// const uploadToS3 = require('../../../fileUploader');
// const User = require('@models/User');
// const Agency = require('@models/Agency');
// jest.mock(User);
// jest.mock(Agency);
// jest.mock(uploadToS3);

// const app = express();
// app.use(express.json());
// app.use('/api/agencies', router);

// describe('POST /api/agencies/create_agency', () => {
//   it('should create an agency successfully', async () => {
//     uploadToS3.mockResolvedValue({ file_name: 'test-photo.jpg' });

//     const mockUser = {
//       _id: 'user123',
//       isAgencyOwner: false,
//       save: jest.fn(),
//     };
//     User.findOne = jest.fn().mockResolvedValue(mockUser);

//     // Mock Agency model
//     const mockAgency = { _id: 'agency123', name: 'Test Agency' };
//     Agency.prototype.save = jest.fn().mockResolvedValue(mockAgency);

//     // Mock User update
//     User.updateOne = jest.fn().mockResolvedValue({});

//     const response = await request(app)
//       .post('/api/agencies/create_agency')
//       .set('Authorization', 'Bearer mockAuthToken')
//       .send({
//         name: 'Test Agency',
//         description: 'Test Description',
//       });

//     expect(response.status).toBe(201);
//     expect(response.body.message).toBe('Agency created successfully');
//     expect(response.body.agency.name).toBe('Test Agency');
//     expect(User.findOne).toHaveBeenCalledWith({ authToken: 'mockAuthToken' });
//     expect(Agency.prototype.save).toHaveBeenCalled();
//     expect(mockUser.isAgencyOwner).toBe(true);
//     expect(mockUser.save).toHaveBeenCalled();
//   });

//   it('should return 500 if an error occurs', async () => {
//     User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

//     const response = await request(app)
//       .post('/api/agencies/create_agency')
//       .set('Authorization', 'Bearer mockAuthToken')
//       .send({
//         name: 'Test Agency',
//         description: 'Test Description',
//       });

//     expect(response.status).toBe(500);
//     expect(response.body.message).toContain('Internal server error');
//   });
// });

const request = require('supertest');
// const router = express.Router();

describe('Agencies Routes', () => {
  it('should respond to a GET request', async () => {
    const response = await request('http://localhost:4000/').get('/');
    expect(response.statusCode).toBe(200);
  });
});
