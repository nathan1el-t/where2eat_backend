import { StatusCodes } from 'http-status-codes';
import { Group, GroupDoc } from './groupModel.js';
import { Types } from 'mongoose';
import { AppError } from '../common/utils/AppError.js';
import { User, type UserDoc } from '../users/userModel.js';
import { CreateGroupInput } from '../shared/schemas/CreateGroupSchema.js';
import { generateUniqueGroupCode } from './utils/generateUniqueGroupCode.js';

export const isUserInGroup = async (
  groupId: string,
  userId: string
): Promise<boolean> => {
  const group = await Group.findById(groupId);
  if (!group) {
    throw new AppError('Group not found or inactive.', StatusCodes.NOT_FOUND);
  }

  return group.users.some((entry) => entry.user.equals(userId));
};

export const joinGroupByCode = async (
  code: string,
  userId: string
): Promise<{ message: string; group: GroupDoc }> => {
  console.log(code);
  const group = await Group.findOne({ code });

  if (!group) {
    throw new AppError('Group not found', StatusCodes.NOT_FOUND);
  }

  const alreadyInGroup = await isUserInGroup(group._id.toString(), userId);

  if (!alreadyInGroup) {
    const user = await User.findById(userId);

    if (!user) throw new AppError('User not found', StatusCodes.NOT_FOUND);

    group.users.push({
      user: new Types.ObjectId(userId),
      role: 'member'
    });
    user.groups.push(group._id);

    await group.save();
    await user.save();
  }

  return {
    message: alreadyInGroup
      ? 'User is already a member of this group'
      : 'User successfully joined the group',
    group,
  };
};

export const leaveGroupById = async (
  groupId: string,
  userId: string
): Promise<{
  leftGroupName?: string;
  error?: string;
}> => {
  const user = await User.findById(userId);
  if (!user) {
    return { error: 'User not found' };
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return { error: 'Group not found' };
  }

  const userEntry = group.users.find((entry: any) =>
    entry.user.equals(userId)
  );

  if (!userEntry) {
    return { error: 'You are not a member of this group' };
  }

  const isOnlyUser = group.users.length === 1;
  const isOnlyAdmin =
    userEntry.role === 'admin' &&
    group.users.filter((entry: any) => entry.role === 'admin').length === 1;

  if (isOnlyAdmin && !isOnlyUser) {
    return {
      error: 'You are the only admin. Please promote another member before leaving.'
    };
  }

  group.users = group.users.filter((entry: any) => !entry.user.equals(userId));

  if (group.users.length === 0) {
    group.active = false;
  }

  await group.save();

  user.groups = user.groups.filter(
    (gId: Types.ObjectId) => gId.toString() !== groupId
  );
  await user.save();

  return { leftGroupName: group.name };
};

type CreateGroupData = CreateGroupInput & {
  code: string;
  users: {
    user: string;
    role: 'admin' | 'member';
  }[];
};

export const createGroupForUser = async (
  userId: string,
  groupInput: CreateGroupInput
): Promise<GroupDoc> => {
  const data: CreateGroupData = {
    ...groupInput,
    code: await generateUniqueGroupCode(),
    users: [
      {
        user: userId,
        role: 'admin',
      },
    ],
  };

  const newGroup = await Group.create(data);

  await User.findByIdAndUpdate(userId, {
    $push: { groups: newGroup._id },
  });

  return newGroup;
};

type PopulatedGroupMember = {
  user: UserDoc
  role: 'admin' | 'member';
};

export const updateGroupMemberRoles = async (
  groupId: string,
  userIds: string[],
  newRole: 'admin' | 'member'
): Promise<{
  alreadyInRole: string[];
  updatedUsers: string[];
}> => {
  const group = await Group.findById(groupId)
    .populate<{ users: PopulatedGroupMember[] }>('users.user', 'username');

  if (!group) throw new Error('Group not found');

  const alreadyInRole: string[] = [];
  const updatedUsers: string[] = [];

  group.users.forEach((member) => {
    const user = member.user;

    if (userIds.includes(user._id.toString())) {
      if (member.role === newRole) {
        alreadyInRole.push(user.username);
      } else {
        member.role = newRole;
        updatedUsers.push(user.username);
      }
    }
  });

  await group.save();

  return { alreadyInRole, updatedUsers };
};

export const removeMembers = async (
  groupId: string,
  userIds: string[]
) => {
  const group = await Group.findById(groupId);
  if (!group) throw new Error('Group not found');

  group.users = group.users.filter(
    (member) => !userIds.includes(member.user.toString())
  );

  await group.save();

  await User.updateMany(
    { _id: { $in: userIds.map((id) => new Types.ObjectId(id)) } },
    { $pull: { groups: group._id } }
  );
};

export const getGroupTopCuisines = async (
  groupId: string
): Promise<Array<{ cuisine: string, score: number }>> => {
  const group = await Group.findById(groupId).populate('users.user');
  if (!group) throw new Error('Group not found');

  const userIds = group.users.map(member => member.user._id);
  const users = await User.find({ _id: { $in: userIds } });

  const CUISINES = [
    'Chinese', 'Korean', 'Japanese', 'Italian', 'Mexican',
    'Indian', 'Thai', 'French', 'Muslim', 'Vietnamese', 'Western', 'Fast Food'
  ];

  const topCuisines: Array<{ cuisine: string, score: number }> = [];

  // Simple average calculation - no influence weighting
  for (const cuisine of CUISINES) {
    let totalScore = 0;
    let memberCount = 0;

    for (const user of users) {
      const preference = user.preferences.get(cuisine) || 3;
      const weight = user.cuisineWeights?.get(cuisine) || 1.0;
      const userScore = preference * weight;

      totalScore += userScore;
      memberCount++;
    }

    const avgScore = memberCount > 0 ? totalScore / memberCount : 3;

    topCuisines.push({
      cuisine,
      score: Number(avgScore.toFixed(2))
    });
  }

  // Sort by score (highest first)
  return topCuisines
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
};

// ==== SIMPLIFIED GROUP RESTAURANT RECOMMENDATIONS ====
// PUT THIS IN: server/src/groups/groupService.ts

export const getGroupRestaurantRecommendations = async (
  groupId: string,
  googlePlaces: any[],
  cuisine: string,
  limit: number = 4
): Promise<any[]> => {
  const recommendations: any[] = [];
  
  // Get group and populate users
  const group = await Group.findById(groupId).populate('users.user');
  if (!group) throw new Error('Group not found');

  const userIds = group.users.map(member => member.user._id);
  const users = await User.find({ _id: { $in: userIds } }); // Fixed: _id not id

  // Calculate simple group average for this cuisine
  let totalPreference = 0;
  let totalWeight = 0;
  let memberCount = 0;

  for (const user of users) {
    const preference = user.preferences.get(cuisine) || 3;
    const weight = user.cuisineWeights?.get(cuisine) || 1.0;
    
    totalPreference += preference;
    totalWeight += weight;
    memberCount++;
  }

  const avgPreference = memberCount > 0 ? totalPreference / memberCount : 3;
  const avgWeight = memberCount > 0 ? totalWeight / memberCount : 1.0;
  const groupCuisineScore = avgPreference * avgWeight;

  for (const place of googlePlaces) {
    try {
      const googleRating = place.rating || 3.0;
      
      // Simple formula: Google Rating × 0.3 + Group Cuisine Score × 0.7
      const combinedScore = (googleRating * 0.3) + (groupCuisineScore * 0.7);
      const finalScore = Math.max(1, Math.min(5, combinedScore));
      
      const reasoning = `Group ${cuisine} preference (${avgPreference.toFixed(1)}/5 avg) × weight (${avgWeight.toFixed(2)} avg) + restaurant rating (${googleRating.toFixed(1)}/5)`;

      const recommendation = {
        place_id: place.place_id,
        name: place.name,
        vicinity: place.vicinity || 'Location not available',
        rating: place.rating,
        price_level: place.price_level,
        geometry: place.geometry,
        photos: place.photos,
        types: place.types,
        cuisine,
        cuisineScore: Number(groupCuisineScore.toFixed(2)),
        combinedScore: Number(finalScore.toFixed(2)),
        reasoning
      };

      recommendations.push(recommendation);
    } catch (error) {
      console.error(`Error processing restaurant ${place.name}:`, error);
    }
  }

  // Sort by combined score and return top results
  return recommendations
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, limit);
};