import mongoose from 'mongoose';

async function connect() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/manager_mail');
        console.log('Kết nối thành công!!')
    } catch (error) {
        console.log('Kết nối thất bại!!')
    }
}

export default { connect };