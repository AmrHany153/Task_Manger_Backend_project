import mongoose from "mongoose";


const memberSchema = new mongoose.Schema({
    user_id: {
        type: Number,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
});

const groupMembersSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true,
    },
    members: [memberSchema],
});

const groupMembers = mongoose.model("group_members", groupMembersSchema);



// queries
export const createDocument = async (group_id) => {
    const result = await groupMembers.create({
        _id: group_id,
        members: []
    })

    return result._id;
}

export const deleteDocument = async (group_id) => {
    const result = await groupMembers.deleteOne({ _id: group_id });

    return result.deletedCount;
}


// -- members queries
export const getOneMember = async (user_id, group_id) => {
    const member = await groupMembers.findOne(
        {_id: group_id, "members.user_id": user_id}, 
        {"members.$": true}
    );
    
    return member;
}

export const getAllMembers = async (group_id) => {
    const members = await groupMembers.find(
        { _id: group_id },
        { members: true }
    )

    return members;
}

export const insertOneMember = async (user_id, group_id, is_moderator) => {
    const newMember = {
        "user_id": user_id,
        "is_moderator": is_moderator
    }
    
    const result = await groupMembers.findOneAndUpdate(
        {
            _id: group_id
        },
        {
             $addToSet: { members: newMember }
        },
        { useFindAndModify: false },
    );

    return result.nModified;
}

export const deleteOneMember = async (user_id, group_id) => {
    const result = await groupMembers.findOneAndUpdate(
        { _id: group_id },
        {
            $pull: { members: { user_id: user_id } }
        },
        { useFindAndModify: false }
    );

    return result.nModified;
}

export const deleteOneMemberFromAll = async (user_id) => {
    const result = await groupMembers.updateMany(
        { "groups.group_id": user_id },
        { $pull: { groups: { group_id: user_id } } },
    );

    return result.nModified;
}


// -- is_moderator queries
export const getIsModerator = async (user_id, group_id) => {
    const is_moderator = await groupMembers.findOne(
        {
            _id: group_id,
            "members.user_id": user_id
        }, 
        { "members.$.is_moderator": true }
    );
    
    return is_moderator;
}

export const updateIsModerator = async (user_id, group_id, is_moderator) => {
    const result = await groupMembers.findOneAndUpdate(
        { 
            _id: group_id,
            "members.user_id": user_id
        },
        {
            $set: { "members.$.is_moderator": is_moderator }
        },
        { useFindAndModify: false }
    )

    return result.nModified;
} 
