const users = [];
const posts = [];
let nextUserId = 1;
let nextPostId = 1;

function matchesWhere(record, where = {}) {
  return Object.entries(where).every(([field, value]) => record[field] === value);
}

export const prisma = {
  user: {
    async findUnique({ where }) {
      return users.find((user) => matchesWhere(user, where)) || null;
    },
    async create({ data }) {
      const user = { id: String(nextUserId), ...data };
      nextUserId += 1;
      users.push(user);
      return user;
    },
  },
  post: {
    async create({ data }) {
      const post = { id: String(nextPostId), ...data };
      nextPostId += 1;
      posts.push(post);
      return post;
    },
    async findMany({ where, orderBy = [], skip = 0, take } = {}) {
      const matchingPosts = posts.filter((post) => matchesWhere(post, where));
      const sortedPosts = [...matchingPosts].sort((left, right) => {
        for (const ordering of orderBy) {
          const [field, direction] = Object.entries(ordering)[0];
          const comparison = compareValues(left[field], right[field]);
          if (comparison !== 0) {
            return direction === 'desc' ? -comparison : comparison;
          }
        }
        return 0;
      });
      const end = take === undefined ? undefined : skip + take;
      return sortedPosts.slice(skip, end);
    },
  },
};

function compareValues(left, right) {
  const leftValue = left instanceof Date ? left.getTime() : left;
  const rightValue = right instanceof Date ? right.getTime() : right;
  if (leftValue < rightValue) return -1;
  if (leftValue > rightValue) return 1;
  return 0;
}
