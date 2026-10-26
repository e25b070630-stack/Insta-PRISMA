// prisma/seed.js
// Wipes users & posts, then re-creates them from seed-data.js.
// Usage: node prisma/seed.js  OR  npx prisma db seed

const prisma = require("../src/db");
const { users, posts } = require("./seed-data");

async function main() {
  // 1. Delete all posts first (foreign key constraint), then all users.
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create all 12 users in one query.
  const createdUsers = await prisma.user.createManyAndReturn({
    data: users.map((u) => ({
      username: u.username,
      email: u.email,
      fullname: u.fullname,
      bio: u.bio ?? null,
      isPrivate: u.isPrivate,
      createdAt: new Date(u.createdAt),
    })),
  });

  // 3. Create all 24 posts in one query.
  const createdPosts = await prisma.post.createManyAndReturn({
    data: posts.map((p) => ({
      imageUrl: p.imageUrl,
      caption: p.caption ?? null,
      location: p.location ?? null,
      createdAt: new Date(p.createdAt),
    })),
  });

  // 4. Print counts from the actual returned data.
  console.log(
    `🌱 Seeded ${createdUsers.length} users and ${createdPosts.length} posts`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
