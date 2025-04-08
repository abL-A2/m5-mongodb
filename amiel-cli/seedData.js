const auctionItems = [
  {
    title: "Antique Microscope",
    description: "A vintage brass and iron microscope from the 19th century.",
    start_price: 50,
    reserve_price: 200,
  },
  {
    title: "Chunk of Pure Copper",
    description: "A raw, unpolished chunk of pure copper weighing 2.5 kg.",
    start_price: 20,
    reserve_price: 60,
  },
  {
    title: "Jar of Mercury",
    description: "A sealed jar containing 500g of liquid mercury, for display purposes only.",
    start_price: 100,
    reserve_price: 300,
  },
  {
    title: "Signed Movie Poster",
    description: "A poster from the 1985 cult classic 'Back to the Future,' signed by the cast.",
    start_price: 200,
    reserve_price: 500,
  },
  {
    title: "Geiger Counter",
    description: "A vintage Geiger counter used in radiation detection.",
    start_price: 75,
    reserve_price: 150,
  },
  {
    title: "Meteorite Fragment",
    description: "A small chunk of a meteorite with a unique iron-nickel composition.",
    start_price: 300,
    reserve_price: 800,
  },
  {
    title: "Replica Lightsaber",
    description: "A high-quality replica of Mace Windu's lightsaber from Star Wars.",
    start_price: 100,
    reserve_price: 400,
  },
  {
    title: "Elemental Display Set",
    description: "A decorative set of sealed glass jars containing samples of iron, sulfur, and carbon.",
    start_price: 75,
    reserve_price: 200,
  },
  {
    title: "Lab Centrifuge",
    description: "A functional centrifuge used for laboratory experiments.",
    start_price: 150,
    reserve_price: 500,
  },
  {
    title: "Rare Vinyl Record",
    description: "A rare first pressing of The Beatles' 'White Album.'",
    start_price: 250,
    reserve_price: 600,
  },
  {
    title: "Gold Nugget",
    description: "A small raw gold nugget weighing approximately 1 ounce.",
    start_price: 500,
    reserve_price: 1500,
  },
  {
    title: "Signed Comic Book",
    description: "An original issue of 'The Amazing Spider-Man #1' signed by Stan Lee.",
    start_price: 1000,
    reserve_price: 3000,
  },
  {
    title: "Test Tube Rack with Samples",
    description: "A rack containing sealed chemical samples from the mid-20th century.",
    start_price: 40,
    reserve_price: 120,
  },
  {
    title: "Vintage Beaker Set",
    description: "A set of vintage glass beakers with etched measurement markings.",
    start_price: 30,
    reserve_price: 90,
  },
  {
    title: "Rare Pokémon Card",
    description: "A holographic first-edition Pikachu card in mint condition.",
    start_price: 1500,
    reserve_price: 4000,
  },
  {
    title: "Sealed Tube of Cesium",
    description: "A sealed, display-only tube containing a small quantity of cesium.",
    start_price: 400,
    reserve_price: 1200,
  },
  {
    title: "Oscilloscope",
    description: "A functional vintage oscilloscope used for electrical signal testing.",
    start_price: 120,
    reserve_price: 400,
  },
  {
    title: "Movie Prop: Ghostbusters Trap",
    description: "A replica of the ghost trap from the original 'Ghostbusters' movie.",
    start_price: 150,
    reserve_price: 450,
  },
  {
    title: "Chunk of Bismuth",
    description: "A small chunk of bismuth crystals set on an acrylic base.",
    start_price: 25,
    reserve_price: 75,
  },
  {
    title: "Autographed Gaming Console",
    description: "A Nintendo 64 console signed by the creators of 'GoldenEye 007.'",
    start_price: 300,
    reserve_price: 900,
  },
];

export default auctionItems;

// db.test -
//   one.insertOne({
//     title: "Moon Rock",
//     description: "A moon rock retrieved during the Apollo 12 mission, sealed inside a glasscase.",
//     start_price: 1200,
//     reserve_price: 2000,
//   });

// {
//   title: "",
//   description: "",
//   start_price: 0,
//   reserve_price: 0,
// },
