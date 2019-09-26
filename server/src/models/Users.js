import mongoose, {Schema} from 'mongoose';

mongoose.connect('mongodb://localhost/twitchome');

const User = new Schema(
    { 
        id: String, 
        accessToken: String, 
        refreshToken: String,
        Streamers: Array,
        user_id: String,
        login: String,
        display_name: String,
        image: String,
        views: String,
        balance: String
    }
)

const Users = mongoose.model('Users', User)

export default Users;