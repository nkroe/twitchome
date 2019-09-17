import mongoose, {Schema} from 'mongoose';

mongoose.connect('mongodb://localhost/twitchome');

const PromoteChannel = new Schema(
    { 
        channel_id: String,
        name: String,
        logo: String,
        banner: String,
        promoteDate: String
    }
)

const PromoteChannels = mongoose.model('PromoteChannels', PromoteChannel)

export default PromoteChannels;