import mongoose from "mongoose";


const groupSchema = new mongoose.Schema({
    group_id: {
        type: Number,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
});

const userGroupsSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true,
    },
    groups: [groupSchema],
});

const userGroups = mongoose.model("user_groups", userGroupsSchema);


// == queries
export const createDocument = async (user_id) => {
    const result = await userGroups.create({
        _id: user_id,
        groups: []
    })

    return result._id;
}

export const deleteDocument = async (user_id) => {
    const result = await userGroups.deleteOne({ _id: user_id });

    return result.deletedCount;
}


// -- groups queries
export const getOneGroup = async (user_id, group_id) => {
    const group = await userGroups.findOne(
        { _id: user_id, "groups.group_id": group_id },
        { "groups.$": true }
    );

    return group;
}

export const getAllGroups = async (user_id) => {
    const groups = await userGroups.find(
        { _id: user_id },
        { groups: true }
    )

    return groups;
}


export const insertOneGroup = async (user_id, group_id, is_moderator) => {
    const newGroup = {
        group_id: group_id,
        is_moderator: is_moderator
    }

    const result = await userGroups.findOneAndUpdate(
        { _id: user_id },
        {
            $addToSet: { groups: newGroup }
        },
        { useFindAndModify: false }
    )

    return result.nModified;
}

export const deleteOneGroup = async (user_id, group_id) => {
    const result = await userGroups.findOneAndUpdate(
        { _id: user_id },
        {
            $pull: { groups: { group_id: group_id } }
        },
        { useFindAndModify: false }
    );

    return result.nModified;
}

export const deleteOneGroupFromAll = async (group_id) => {
    const result = await userGroups.updateMany(
        { "groups.group_id": group_id },
        { $pull: { groups: { group_id: group_id } } },
    );

    return result.nModified;
}


// -- is_moderator queries
export const getIsModerator = async (user_id, group_id) => {
    const is_moderator = await userGroups.findOne(
        {
            _id: user_id,
            "groups.group_id": group_id
        },
        { "groups.$.is_moderator": true }
    );

    return is_moderator;
}

export const updateIsModerator = async (user_id, group_id, is_moderator) => {
    const result = await userGroups.findOneAndUpdate(
        {
            _id: user_id,
            "groups.group_id": group_id
        },
        {
            $set: { "groups.$.is_moderator": is_moderator }
        },
        { useFindAndModify: false }
    )

    return result.nModified;
} 
