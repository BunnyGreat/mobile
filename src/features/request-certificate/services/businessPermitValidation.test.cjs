const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  module._compile(outputText, filename);
};

const {
  BUSINESS_APPLICATION_TYPES,
  BUSINESS_TYPES,
} = require("../constants/businessPermitTypes.ts");
const { CLEARANCE_PURPOSES } = require("../constants/clearancePurposes.ts");
const { INDIGENCY_PURPOSES } = require("../constants/indigencyPurposes.ts");
const { validateBarangayClearance } = require("./certificateValidation.service.ts");
const { validateBusinessPermit } = require("./businessPermitValidation.service.ts");
const { buildBusinessPermitPayload } = require("../utils/buildBusinessPermitPayload.ts");

const validForm = {
  businessName: "Example Store",
  natureOfBusiness: "Sari-Sari Store",
  initialCapital: "12500.50",
  businessAddress: "1 Main Street",
  applicationType: "New",
  businessOwnerFullName: "Resident Example",
  homeAddress: "2 Home Street",
  contactNumber: "09123456789",
};

test("keeps all 77 business categories and separate application types", () => {
  assert.deepEqual(BUSINESS_TYPES, [
    "Burger Stand / Food Cart",
    "Sari-Sari Store",
    "Small Type of Business",
    "Bake Shop",
    "Coffee, Milk Tea, Frappe / Pastry Shop",
    "Bicycle / Motor Spare Parts",
    "Billiards / Pool",
    "Canteen",
    "Car Wash",
    "Cellphone / Computer / TV Repair",
    "Egg / Dried Fish / Cooking Oil Dealer",
    "Enterprises (Depending on Business Type)",
    "Frozen Goods",
    "Garden / Flower Shop",
    "General Merchandise",
    "Grilled Chicken / Liempo",
    "Gym",
    "Home Décor / Housewares",
    "Laundry Shop",
    "LPG Dealer",
    "Motorcycle Shop / Repair",
    "Musical Instruments / Sports Apparel",
    "Online Shop",
    "Party Needs",
    "Pet Shop",
    "Photoshop Studio",
    "Rendering Services",
    "Restobar / KTV / Grill / Korean BBQ",
    "Salon / Parlor with Spa",
    "School Supplies / Needs",
    "Soap / Perfume / Fabric Conditioner Dealer",
    "Surplus / Garments",
    "Tailoring",
    "Ukay-Ukay / RTW / Footwears",
    "Vape Shop / E-Cigarettes",
    "Vegetables / Fruits / Meat & Fish Vendor",
    "Videoke Rental",
    "Watch / Shoe Repair",
    "Water Station",
    "Welding / Vulcanizing Shop",
    "Aluminum / Glass Fabrication",
    "Kid's Place / Arcade",
    "Photography / Videography Services",
    "Travel and Tours / Ticketing Services",
    "Accounting Consultancy",
    "Amusement Park (Perya)",
    "Auto Repair Shop",
    "Catering Services",
    "Contractor / Construction / Engineering Services / Developer",
    "Convenience Store",
    "Furniture / Handicrafts / Haulstery",
    "Garage (No Objection)",
    "Lechon",
    "Lending",
    "Lying-in / Dental / Medical Clinic",
    "Mechanical / Electrical / Auto Shop / Repair",
    "Pharmacy / Drug Store",
    "Plasticwares",
    "Poultry Supply",
    "Realty / Real Estate",
    "Rice Dealer",
    "School Tutorial / Learning Center",
    "Space / Van Rental",
    "Tailoring (Sub-con)",
    "Transport Services",
    "Crasher / Quarry",
    "Funeral Services",
    "Gasoline Station",
    "Gravel and Sand",
    "Grocery",
    "Hardware / Construction Supplies / Heavy Equipments",
    "Junkshop",
    "Pawnshop",
    "Remittance / Payment Center",
    "Resort",
    "Supermarket",
    "Trucking / Hauling",
  ]);
  assert.deepEqual(BUSINESS_APPLICATION_TYPES, ["New", "Renewal"]);
});

test("exposes exactly the requested clearance and indigency purposes", () => {
  assert.deepEqual(CLEARANCE_PURPOSES, [
    "Loan Application (Motorcycle, E-Bike, Housing & Car)",
    "LTOPF Requirement",
    "Electrical Application",
    "Police Clearance Application",
    "Postal ID Application",
    "Travel Abroad Application",
    "Water Application",
    "Bank Requirement",
    "Bail Bond Application",
    "Late Registration",
    "Local Employment",
    "NBI Requirement",
    "Private Body Number (Application/Renewal)",
    "Residency",
    "TESDA / School / OJT Requirement",
  ]);
  assert.deepEqual(INDIGENCY_PURPOSES, [
    "Billing Assistance",
    "Educational Assistance",
    "Financial Assistance",
    "Late Registration",
    "Legal Assistance",
    "Medical Assistance",
    "Scholarship Program",
    "School Requirement",
    "Sponsorship Program",
  ]);
  assert.deepEqual(validateBarangayClearance({ purpose: CLEARANCE_PURPOSES[0] }), {});
  assert.ok(validateBarangayClearance({ purpose: "custom purpose" }).purpose);
});

test("accepts complete permit data and zero or decimal capital", () => {
  assert.deepEqual(validateBusinessPermit(validForm), {});
  assert.deepEqual(
    validateBusinessPermit({ ...validForm, initialCapital: "0" }),
    {},
  );
  assert.deepEqual(
    validateBusinessPermit({ ...validForm, initialCapital: ".5" }),
    {},
  );
});

test("maps the selected application type to requestFor without replacing nature of business", () => {
  const newApplication = buildBusinessPermitPayload({
    ...validForm,
    applicationType: "New",
  });
  assert.equal(newApplication.requestFor, "new");
  assert.equal(newApplication.businessInformation.natureOfBusiness, "Sari-Sari Store");

  const renewal = buildBusinessPermitPayload({
    ...validForm,
    applicationType: "Renewal",
  });
  assert.equal(renewal.requestFor, "renew");
  assert.equal(renewal.businessInformation.natureOfBusiness, "Sari-Sari Store");
});

test("rejects missing fields, unknown categories, invalid capital, and application types", () => {
  const errors = validateBusinessPermit({
    ...validForm,
    businessName: " ",
    natureOfBusiness: "Not listed",
    initialCapital: "-1",
    businessAddress: "",
    applicationType: "Transfer",
    businessOwnerFullName: "",
    homeAddress: "",
    contactNumber: " ",
  });
  assert.deepEqual(Object.keys(errors).sort(), [
    "applicationType",
    "businessAddress",
    "businessName",
    "businessOwnerFullName",
    "contactNumber",
    "homeAddress",
    "initialCapital",
    "natureOfBusiness",
  ]);

  for (const amount of ["", "-0.01", "12.345", "not a number"]) {
    assert.ok(
      validateBusinessPermit({ ...validForm, initialCapital: amount })
        .initialCapital,
    );
  }
});
