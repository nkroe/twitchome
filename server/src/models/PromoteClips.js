import mongoose, {Schema} from 'mongoose';

mongoose.connect('mongodb://localhost/twitchome');

const PromoteClip = new Schema(
    { 
        slug: String
    }
)

const PromoteClips = mongoose.model('PromoteClips', PromoteClip)

export default PromoteClips;