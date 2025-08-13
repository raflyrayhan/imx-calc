// lib/catalog.ts
export type Tool = {
  title: string;
  href: string;          // route to the tool
  description?: string;
  tags?: string[];
};

export type Category = {
  slug: string;
  title: string;
  description: string;
  count: number;         // show the red "X CALCULATIONS" count
  items: Tool[];         // tools inside this category
};

export const PIPING_CATEGORIES: Category[] = [
  {
    slug: "fluid-flow",
    title: "Fluid Flow",
    count: 16,
    description:
      "Pressure losses in pipe and fittings, natural gas pipe sizing, two-phase flow, pump sizing and compressor rating.",
    items: [
        { title: "Pipe Sizing — Liquids & Solvents", href: "/piping/pipe-sizing-liquids" },
        { title: "Single Phase Fluid Flow", href: "/piping/single-phase-flow" },
        { title: "Compressible Fluid Flow", href: "/piping/compressible-flow" },
        { title: "Power Law Fluid", href: "/piping/power-law" },
        { title: "Blower & Fan Calculation", href: "/piping/blower-fan" },
      // Add tools as you build them, for example:
      // { title: "Single-Phase Pressure Drop", href: "/piping/pressure-drop" },
    ],
  },
  {
    slug: "heat-transfer",
    title: "Heat Transfer",
    count: 12,
    description:
      "Double pipe exchanger, air-cooled exchanger, LMTD calculation, correction factors, insulation heat loss and jacketed vessel heat transfer.",
    items: [
      { title: "Heat Exchanger Rating", href: "/piping/heat-exchanger-rating" },
    ],
  },
  {
    slug: "instrument",
    title: "Instrument",
    count: 6,
    description:
      "Safety valve sizing and orifice sizing for gas & liquid service.",
    items: [],
  },
  {
    slug: "properties",
    title: "Properties",
    count: 3,
    description:
      "Natural gas viscosity, compressibility factor and properties estimation.",
    items: [],
  },
  {
    slug: "distillation",
    title: "Distillation",
    count: 8,
    description:
      "Packed tower sizing and binary distillation based on McCabe-Thiele diagram.",
    items: [],
  },
  {
    slug: "agitation",
    title: "Agitation",
    count: 4,
    description:
      "Agitator power and scale-up.",
    items: [],
  },
  {
    slug: "vle",
    title: "Vapor Liquid Equilibria",
    count: 7,
    description:
      "Binary VLE, multicomponent flash, and curve-fitting vapor pressure.",
    items: [],
  },
  {
    slug: "equipment",
    title: "Equipment",
    count: 6,
    description:
      "Vessel thickness, vessel volume and sizing of vertical & horizontal separators.",
    items: [],
  },
  {
    slug: "others",
    title: "Others",
    count: 7,
    description:
      "Steam tables, unit conversion, gas conversion and psychrometric estimations.",
    items: [
      { title: "Gasoline Blend Property", href: "/gasoline-blend" },
    ],
  },
];

export const CFD_TOOLS: Tool[] = [
  { title: "OpenFOAM Solver Selector", href: "/openfoam" },
  { title: "CFD Study Complexity Classifier", href: "/cfd" },
  { title: "Cooling Airflow Calculator", href: "/cooling" },
  { title: "Fin Tube Surface Area", href: "/fin-tube" },
  { title: "Gasoline Blend Property", href: "/gasoline-blend" },
  { title: "Pyrolysis Reactor Design", href: "/pyrolysis-reactor" },
  { title: "Combined Plastic Pyrolysis & Reactor Design" , href: "/pyrolysis-combined" },
  // add more CFD tools here
];
