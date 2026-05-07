import { prisma } from "./index";

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@bdesh.shop" },
    update: {
      password: "$2b$12$smJVrYYKFxZXDaStIKQusOYVMkMpVlUyUBu5oPzExcFZFb19MghAm",
    },
    create: {
      email: "admin@bdesh.shop",
      name: "System Admin",
      password: "$2b$12$smJVrYYKFxZXDaStIKQusOYVMkMpVlUyUBu5oPzExcFZFb19MghAm",
      role: "ADMIN",
    },
  });

  // Create a Roseo store for testing
  const existingStore = await prisma.store.findUnique({
    where: { subdomain: "roseo" }
  });

if (!existingStore) {
    const store = await prisma.store.create({
      data: {
        name: "ROSEO",
        slug: "roseo",
        subdomain: "roseo",
        description: "Premium leather goods crafted with timeless elegance",
        status: "APPROVED",
        ownerId: admin.id,
        theme: JSON.stringify({
          templateId: "shopify",
          primaryColor: "#0a1929",
        }),
        settings: JSON.stringify({
          currency: "USD"
        })
      }
    });

    // Add some sample products
    await prisma.product.createMany({
      data: [
        {
          storeId: store.id,
          name: "Classic Leather Tote",
          slug: "classic-leather-tote",
          description: "Handcrafted premium leather tote bag with spacious interior",
          price: 299.00,
          images: JSON.stringify(["https://placehold.co/600x600/0a1929/ffffff?text=Tote"]),
          featured: true,
          status: "active"
        },
        {
          storeId: store.id,
          name: "Executive Briefcase",
          slug: "executive-briefcase",
          description: "Premium leather briefcase with laptop compartment",
          price: 399.00,
          images: JSON.stringify(["https://placehold.co/600x600/0a1929/ffffff?text=Briefcase"]),
          featured: true,
          status: "active"
        },
        {
          storeId: store.id,
          name: "Leather Crossbody Bag",
          slug: "leather-crossbody-bag",
          description: "Stylish crossbody bag perfect for daily wear",
          price: 189.00,
          images: JSON.stringify(["https://placehold.co/600x600/0a1929/ffffff?text=Crossbody"]),
          featured: false,
          status: "active"
        },
        {
          storeId: store.id,
          name: "RFID Wallet",
          slug: "rfid-wallet",
          description: "Slim leather wallet with RFID protection",
          price: 89.00,
          images: JSON.stringify(["https://placehold.co/600x600/0a1929/ffffff?text=Wallet"]),
          featured: false,
          status: "active"
        }
      ]
    });

    console.log("Created ROSEO store with sample products");
  }

  console.log(`Created admin user: ${admin.email}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
