import { PrismaClient, SkillLevel, WaveLevel, ImageType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log(" Seeding...\n");

    // ========================
    // CATEGORIES
    // ========================
const categoryData = [
  // Surfboard categories (sudah ada)
  { name: "Performance", slug: "performance" },
  { name: "Hybrid/Fishy", slug: "hybrid-fishy" },
  { name: "Longboard", slug: "longboard" },
  { name: "Funboard", slug: "funboard" },
  { name: "Twin Fin", slug: "twin-fin" },

  // Accessory categories (baru)
  { name: "Traction Pad", slug: "traction-pad" },
  { name: "Leash", slug: "leash" },
  { name: "Fins", slug: "fins" },
  { name: "Board Bag", slug: "board-bag" },
  { name: "Sock", slug: "sock" },
];

    const categories: Record<string, string> = {};
    for (const cat of categoryData) {
        const result = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
        categories[cat.slug] = result.id;
    }
    console.log(" Categories seeded");

    // ========================
    // ADMIN
    // ========================
    const hashedPassword = await bcrypt.hash("admin123", 12);
    await prisma.user.upsert({
        where: { email: "admin@freepig.com" },
        update: {},
        create: {
            name: "Admin Freepig",
            email: "admin@freepig.com",
            password: hashedPassword,
            role: "ADMIN",
        },
    });
    console.log(" Admin seeded");
    console.log("   Email    : admin@freepig.com");
    console.log("   Password : admin123\n");

    // ========================
    // PRODUCTS
    // ========================
    const products = [
        {
            name: "Claim",
            slug: "claim",
            categorySlug: "performance",
            skillLevel: SkillLevel.ADVANCED,
            waveLevels: [WaveLevel.SMALL, WaveLevel.MEDIUM],
            description: `CLAIM MODEL | Pro-Elite Performance\nThe Ultimate Weapon for 3-6ft Perfection\n\nWhy "CLAIM"?\nWe named this model the CLAIM because it's built for the waves that make you want to throw your hands up. Whether you're racing a fast beach break or locking into a reef barrel, this board gives you the confidence to "claim" every ride.\n\nThe Technical Specs:\n* Size Range: Exclusively available from 5'5" to 6'0"\n* Refined Rail Line: Lower rail profile for instant "bite" and razor-sharp turns\n* Controlled Rocker: Perfectly tuned for steep and powerful sections\n* Single to Double Concave: Maximum lift and effortless speed\n* Thruster Setup: Strictly 3-fin for perfect balance of drive and stability\n\nAt a Glance:\n* Wave Height: 3ft – 6ft (Chest high to overhead)\n* Skill Level: Intermediate – Advanced\n* Vibe: Fast, Precise, and Reliable`,
            dimensions: [
                { size: "5'6", width: "18 1/8", thickness: "2 1/4", volume: "24.2" },
                { size: "5'7", width: "18 1/4", thickness: "2 1/4", volume: null },
                { size: "5'8", width: "18 1/4", thickness: "2 3/8", volume: null },
                { size: "5'9", width: "18 1/2", thickness: "2 3/8", volume: "26.6" },
                { size: "5'10", width: "18 5/8", thickness: "2 7/16", volume: "27.7" },
                { size: "5'11", width: "18 3/4", thickness: "2 1/2", volume: "29.2" },
                { size: "6'0", width: "18 7/8", thickness: "2 1/2", volume: "29.8" },
            ],
            images: [
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129950/surf-store/products/claim-claim-logo.jpg", type: ImageType.DECK, order: 0 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129953/surf-store/products/claim-claim-%281%29.jpg", type: ImageType.DECK, order: 1 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129962/surf-store/products/claim-claim-%282%29.jpg", type: ImageType.BOTTOM, order: 2 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129960/surf-store/products/claim-claim-%283%29.jpg", type: ImageType.NOSE, order: 3 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129958/surf-store/products/claim-claim-%284%29.jpg", type: ImageType.FINS, order: 4 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129955/surf-store/products/claim-claim-%285%29.jpg", type: ImageType.RAIL, order: 5 },
            ],
        },
        {
            name: "Rooster",
            slug: "rooster",
            categorySlug: "performance",
            skillLevel: SkillLevel.ADVANCED,
            waveLevels: [WaveLevel.SMALL, WaveLevel.MEDIUM],
            description: null,
            dimensions: [],
            images: [
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129911/surf-store/products/rooster-rooster.jpg", type: ImageType.DECK, order: 0 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129913/surf-store/products/rooster-rooster-%281%29.jpg", type: ImageType.DECK, order: 1 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129907/surf-store/products/rooster-rooster-%282%29.jpg", type: ImageType.DECK, order: 2 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129904/surf-store/products/rooster-rooster-%283%29.jpg", type: ImageType.DECK, order: 3 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129902/surf-store/products/rooster-rooster-%284%29.jpg", type: ImageType.BOTTOM, order: 4 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129900/surf-store/products/rooster-rooster-%285%29.jpg", type: ImageType.BOTTOM, order: 5 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129898/surf-store/products/rooster-rooster-%286%29.jpg", type: ImageType.NOSE, order: 6 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129896/surf-store/products/rooster-rooster-%287%29.jpg", type: ImageType.FINS, order: 7 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129893/surf-store/products/rooster-rooster-%288%29.jpg", type: ImageType.RAIL, order: 8 },
            ],
        },
        {
            name: "Mahi-Mahi",
            slug: "mahi-mahi",
            categorySlug: "hybrid-fishy",
            skillLevel: SkillLevel.INTERMEDIATE,
            waveLevels: [WaveLevel.SMALL, WaveLevel.MEDIUM],
            description: null,
            dimensions: [],
            images: [
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129916/surf-store/products/mahi-mahi-mahi-mahi-logo.jpg", type: ImageType.DECK, order: 0 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129921/surf-store/products/mahi-mahi-mahi-mahi-%281%29.jpg", type: ImageType.DECK, order: 1 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129923/surf-store/products/mahi-mahi-mahi-mahi-%282%29.jpg", type: ImageType.BOTTOM, order: 2 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129926/surf-store/products/mahi-mahi-mahi-mahi-%283%29.jpg", type: ImageType.NOSE, order: 3 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129919/surf-store/products/mahi-mahi-mahi-mahi-%284%29.jpg", type: ImageType.FINS, order: 4 },
            ],
        },
        {
            name: "Double Hook",
            slug: "double-hook",
            categorySlug: "hybrid-fishy",
            skillLevel: SkillLevel.INTERMEDIATE,
            waveLevels: [WaveLevel.SMALL, WaveLevel.MEDIUM],
            description: null,
            dimensions: [],
            images: [
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129975/surf-store/products/double-hook-double-hook-%281%29.jpg", type: ImageType.DECK, order: 0 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129973/surf-store/products/double-hook-double-hook-%282%29.jpg", type: ImageType.BOTTOM, order: 1 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129971/surf-store/products/double-hook-double-hook-%283%29.jpg", type: ImageType.NOSE, order: 2 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129969/surf-store/products/double-hook-double-hook-%284%29.jpg", type: ImageType.FINS, order: 3 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129966/surf-store/products/double-hook-double-hook-%285%29.jpg", type: ImageType.RAIL, order: 4 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129964/surf-store/products/double-hook-double-hook-%286%29.jpg", type: ImageType.RAIL, order: 5 },
            ],
        },
        {
            name: "Black Flame",
            slug: "black-flame",
            categorySlug: "performance",
            skillLevel: SkillLevel.ADVANCED,
            waveLevels: [WaveLevel.SMALL, WaveLevel.MEDIUM],
            description: null,
            dimensions: [],
            images: [
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129772/surf-store/products/black-flame-black-flame-logo.jpg", type: ImageType.DECK, order: 0 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129795/surf-store/products/black-flame-black-flame-%281%29.png", type: ImageType.DECK, order: 1 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129797/surf-store/products/black-flame-black-flame-%282%29.png", type: ImageType.BOTTOM, order: 2 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129780/surf-store/products/black-flame-black-flame-%283%29.jpg", type: ImageType.NOSE, order: 3 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129790/surf-store/products/black-flame-black-flame-%284%29.jpg", type: ImageType.FINS, order: 4 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129787/surf-store/products/black-flame-black-flame-%285%29.jpg", type: ImageType.RAIL, order: 5 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129778/surf-store/products/black-flame-black-flame-%286%29.jpg", type: ImageType.RAIL, order: 6 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129792/surf-store/products/black-flame-black-flame-%287%29.jpg", type: ImageType.RAIL, order: 7 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129775/surf-store/products/black-flame-black-flame-%288%29.jpg", type: ImageType.RAIL, order: 8 },
            ],
        },
        {
            name: "Hyper Active",
            slug: "hyper-active",
            categorySlug: "hybrid-fishy",
            skillLevel: SkillLevel.ADVANCED,
            waveLevels: [WaveLevel.SMALL, WaveLevel.MEDIUM],
            description: null,
            dimensions: [],
            images: [
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129770/surf-store/products/hyper-active-hyper-active-logo.jpg", type: ImageType.DECK, order: 0 },
            ],
        },
        {
            name: "Twin Fin",
            slug: "twin-fin",
            categorySlug: "twin-fin",
            skillLevel: SkillLevel.ADVANCED,
            waveLevels: [WaveLevel.SMALL, WaveLevel.MEDIUM],
            description: null,
            dimensions: [],
            images: [
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129764/surf-store/products/twin-fin-twin-fins-%281%29.jpg", type: ImageType.DECK, order: 0 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129767/surf-store/products/twin-fin-twin-fins-%282%29.jpg", type: ImageType.BOTTOM, order: 1 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129762/surf-store/products/twin-fin-twin-fins-%283%29.jpg", type: ImageType.NOSE, order: 2 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129759/surf-store/products/twin-fin-twin-fins-%284%29.jpg", type: ImageType.FINS, order: 3 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129756/surf-store/products/twin-fin-twin-fins-%285%29.jpg", type: ImageType.RAIL, order: 4 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129754/surf-store/products/twin-fin-twin-fins-%286%29.jpg", type: ImageType.RAIL, order: 5 },
            ],
        },
        {
            name: "Semar Mesem",
            slug: "semar-mesem",
            categorySlug: "funboard",
            skillLevel: SkillLevel.BEGINNER,
            waveLevels: [WaveLevel.SMALL, WaveLevel.MEDIUM],
            description: null,
            dimensions: [],
            images: [
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129751/surf-store/products/semar-mesem-semar-mesem-logo.jpg", type: ImageType.DECK, order: 0 },
            ],
        },
        {
            name: "Fun Board",
            slug: "fun-board",
            categorySlug: "funboard",
            skillLevel: SkillLevel.BEGINNER,
            waveLevels: [WaveLevel.SMALL, WaveLevel.MEDIUM],
            description: null,
            dimensions: [],
            images: [
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129748/surf-store/products/fun-board-fun-board-%281%29.jpg", type: ImageType.DECK, order: 0 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129746/surf-store/products/fun-board-fun-board-%282%29.jpg", type: ImageType.BOTTOM, order: 1 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129744/surf-store/products/fun-board-fun-board-%283%29.jpg", type: ImageType.NOSE, order: 2 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129741/surf-store/products/fun-board-fun-board-%284%29.jpg", type: ImageType.FINS, order: 3 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129739/surf-store/products/fun-board-fun-board-%285%29.jpg", type: ImageType.RAIL, order: 4 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129736/surf-store/products/fun-board-fun-board-%286%29.jpg", type: ImageType.RAIL, order: 5 },
            ],
        },
        {
            name: "Malibu",
            slug: "malibu",
            categorySlug: "longboard",
            skillLevel: SkillLevel.BEGINNER,
            waveLevels: [WaveLevel.SMALL],
            description: null,
            dimensions: [],
            images: [
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129730/surf-store/products/malibu-malibu-%281%29.jpg", type: ImageType.DECK, order: 0 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129734/surf-store/products/malibu-malibu-%282%29.jpg", type: ImageType.BOTTOM, order: 1 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129732/surf-store/products/malibu-malibu-%283%29.jpg", type: ImageType.RAIL, order: 2 },
            ],
        },
        {
            name: "Long Board",
            slug: "long-board",
            categorySlug: "longboard",
            skillLevel: SkillLevel.BEGINNER,
            waveLevels: [WaveLevel.SMALL],
            description: null,
            dimensions: [],
            images: [
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129709/surf-store/products/long-board-long-board-%281%29.jpg", type: ImageType.DECK, order: 0 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129712/surf-store/products/long-board-long-board-%282%29.jpg", type: ImageType.BOTTOM, order: 1 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129711/surf-store/products/long-board-long-board-%283%29.jpg", type: ImageType.NOSE, order: 2 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129715/surf-store/products/long-board-long-board-%284%29.jpg", type: ImageType.RAIL, order: 3 },
            ],
        },
        {
            name: "Atomic",
            slug: "atomic",
            categorySlug: "hybrid-fishy",
            skillLevel: SkillLevel.INTERMEDIATE,
            waveLevels: [WaveLevel.SMALL, WaveLevel.MEDIUM],
            description: null,
            dimensions: [],
            images: [
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129717/surf-store/products/atomic-atomic-logo.jpg", type: ImageType.DECK, order: 0 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129719/surf-store/products/atomic-atomic-%281%29.jpg", type: ImageType.DECK, order: 1 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129727/surf-store/products/atomic-atomic-%282%29.jpg", type: ImageType.BOTTOM, order: 2 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129725/surf-store/products/atomic-atomic-%283%29.jpg", type: ImageType.NOSE, order: 3 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129723/surf-store/products/atomic-atomic-%284%29.jpg", type: ImageType.FINS, order: 4 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129721/surf-store/products/atomic-atomic-%285%29.jpg", type: ImageType.RAIL, order: 5 },
            ],
        },
        {
            name: "G45",
            slug: "g45",
            categorySlug: "performance",
            skillLevel: SkillLevel.ADVANCED,
            waveLevels: [WaveLevel.MEDIUM, WaveLevel.BIG],
            description: null,
            dimensions: [],
            images: [
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129706/surf-store/products/g45-g45-logo.jpg", type: ImageType.DECK, order: 0 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129688/surf-store/products/venom-g45-%281%29.jpg", type: ImageType.DECK, order: 1 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129686/surf-store/products/venom-g45-%282%29.jpg", type: ImageType.BOTTOM, order: 2 },
            ],
        },
        {
            name: "Claim Groms",
            slug: "claim-groms",
            categorySlug: "performance",
            skillLevel: SkillLevel.GROMS,
            waveLevels: [WaveLevel.SMALL, WaveLevel.MEDIUM],
            description: null,
            dimensions: [],
            images: [
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129699/surf-store/products/claim-groms-claim-groms-logo.jpg", type: ImageType.DECK, order: 0 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129701/surf-store/products/claim-groms-claim-groms-%281%29.jpg", type: ImageType.DECK, order: 1 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129704/surf-store/products/claim-groms-claim-groms-%282%29.jpg", type: ImageType.BOTTOM, order: 2 },
            ],
        },
        {
            name: "Majestic",
            slug: "majestic",
            categorySlug: "hybrid-fishy",
            skillLevel: SkillLevel.INTERMEDIATE,
            waveLevels: [WaveLevel.SMALL, WaveLevel.MEDIUM],
            description: null,
            dimensions: [],
            images: [
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129697/surf-store/products/majestic-majestic-logo.jpg", type: ImageType.DECK, order: 0 },
            ],
        },
        {
            name: "Venom",
            slug: "venom",
            categorySlug: "performance",
            skillLevel: SkillLevel.ADVANCED,
            waveLevels: [WaveLevel.WAVE_POOL],
            description: null,
            dimensions: [],
            images: [
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129684/surf-store/products/venom-venom-logo.jpg", type: ImageType.DECK, order: 0 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129692/surf-store/products/venom-venom-%281%29.jpg", type: ImageType.DECK, order: 1 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129690/surf-store/products/venom-venom-%282%29.jpg", type: ImageType.BOTTOM, order: 2 },
                { url: "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129695/surf-store/products/venom-venom-%283%29.jpg", type: ImageType.FINS, order: 3 },
            ],
        },
    ];

    console.log(" Seeding products...");

    for (const p of products) {
        const product = await prisma.product.upsert({
            where: { slug: p.slug },
            update: {},
            create: {
                name: p.name,
                slug: p.slug,
                description: p.description,
                categoryId: categories[p.categorySlug],
                skillLevel: p.skillLevel,
                waveLevels: { set: p.waveLevels },
                isActive: true,
                dimensions: p.dimensions.length > 0
                    ? { create: p.dimensions }
                    : undefined,
                images: { create: p.images },
            },
        });
        console.log(`   ✓ ${product.name}`);
    }

    console.log("\n Seeding complete!");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());