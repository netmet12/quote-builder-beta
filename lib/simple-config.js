// Simple, readable config structure for the quote builder
// Based on the inspiration config but adapted for the quote builder needs

export const quoteConfig = {
  // Product types
  types: {
    10: "Metal Door",
    20: "Wood Door", 
    30: "Metal Building Door",
    40: "Metal Frame Only"
  },
  
  typeKeys: {
    metal_door: 10,
    wood_door: 20,
    metal_building_door: 30,
    metal_frame_only: 40
  },
  
  typeImages: {
    10: "/images/01-Metal-Doors.jpg",
    20: "/images/02-Wood-Doors.jpg", 
    30: "/images/03-Metal-Building-Doors.jpg",
    40: "/images/05-Frames-Only.jpg"
  },
  
  typeDescriptions: {
    10: "(Interior or Exterior Use)",
    20: "(Interior Use Only)", 
    30: "(Pre-Engineered Steel Building Use)",
    40: "(Frame Only - No Door)"
  },

  // Sections for each product type - simplified structure
  sections: {
    // Metal Door (10) sections
    10: {
      1: {
        title: "Select Metal Door Type",
        columns: 2,
        required: true,
        options: {
          44: { name: "Door with Frame", description: "(18 gauge door w/ 16 gauge frame - primed gray)", image: "/placeholder.svg" },
          45: { name: "Replacement Door Only", description: "(18 gauge primed gray door - re-use existing frame)", image: "/placeholder.svg" }
        },
        order: [44, 45]
      },
      2: {
        title: "Single or Double Door",
        columns: 2,
        required: true,
        options: {
          46: { name: "Single Door", description: "", image: "/placeholder.svg" },
          47: { name: "Double Door", description: "", image: "/placeholder.svg" }
        },
        order: [46, 47]
      },
      3: {
        title: "Door Width",
        columns: 4,
        required: true,
        options: {
          48: { name: '2\'0"', description: "24 inch - 23-3/4\" Actual Size", popular: false },
          49: { name: '2\'4"', description: "28 inch - 27-3/4\" Actual Size", popular: false },
          50: { name: '2\'6"', description: "30 inch - 29-3/4\" Actual Size", popular: false },
          51: { name: '2\'8"', description: "32 inch - 31-3/4\" Actual Size", popular: false },
          52: { name: '2\'10"', description: "34 inch - 33-3/4\" Actual Size", popular: false },
          53: { name: '3\'0"', description: "36 inch - 35-3/4\" Actual Size", popular: true },
          54: { name: '3\'4"', description: "40 inch - 39-3/4\" Actual Size", popular: false },
          55: { name: '3\'6"', description: "42 inch - 41-3/4\" Actual size", popular: false },
          56: { name: '3\'8"', description: "44 inch - 43-3/4\" Actual Size", popular: false },
          57: { name: '4\'0"', description: "48 inch - 47-3/4\" Actual Size", popular: false },
          58: { name: '4\'0"', description: "two 24 inch doors - Each Door 23-3/4\" Actual Size", popular: false },
          60: { name: '5\'0"', description: "two 30 inch doors - Each Door 29-3/4\" Actual size", popular: false },
          61: { name: '5\'4"', description: "two 32 inch doors - Each Door 31-3/4\" Actual Size", popular: false },
          63: { name: '6\'0"', description: "two 36 inch doors - Each Door 35-3/4\" Actual Size", popular: true },
          65: { name: '7\'0"', description: "two 42 inch doors - Each Door 41-3/4\" Actual Size", popular: false },
          67: { name: '8\'0"', description: "two 48 inch doors - Each Door 47-3/4\" Actual Size", popular: false }
        },
        conditions: [
          { when: { section: 2, options: [46] }, show: [48,49,50,51,52,53,54,55,56,57] },
          { when: { section: 2, options: [47] }, show: [58,60,61,63,65,67] }
        ],
        order: [48,49,50,51,52,53,54,55,56,57,58,60,61,63,65,67]
      },
      4: {
        title: "Door Height",
        columns: 4,
        required: true,
        options: {
          68: { name: '6\'8"', description: "80 inch - 79-1/8\" Actual size", popular: false },
          69: { name: '7\'0"', description: "84 inch - 83-1/8\" Actual Size", popular: true },
          70: { name: '8\'0"', description: "96 inch - 95-1/8\" Actual Size", popular: false },
          71: { name: "Other", description: "", customInput: true }
        },
        order: [68, 69, 70, 71]
      },
      5: {
        title: "Door Hand",
        columns: 4,
        required: true,
        options: {
          72: { name: "LHR", description: "Left Hand Reverse (hinges on left, door swings out)", image: "/placeholder.svg" },
          73: { name: "LH", description: "Left Hand (hinges on left, door swings in)", image: "/placeholder.svg" },
          74: { name: "RH", description: "Right Hand (hinges on right, door swings in)", image: "/placeholder.svg" },
          75: { name: "RHR", description: "Right Hand Reverse (hinges on right, door swings out)", image: "/placeholder.svg" }
        },
        conditions: [
          { when: { section: 2, options: [46] }, show: [72,73,74,75] }
        ],
        order: [72, 73, 74, 75]
      },
      24: {
        title: "Which Door is Active?",
        columns: 2,
        required: true,
        options: {
          139: { name: "Left Door", description: "Left door is the active (main) door", image: "/placeholder.svg" },
          140: { name: "Right Door", description: "Right door is the active (main) door", image: "/placeholder.svg" }
        },
        conditions: [
          { when: { section: 2, options: [47] }, show: [139, 140] }
        ],
        order: [139, 140]
      },
      6: {
        title: "Interior or Exterior Application", 
        columns: 2,
        required: true,
        options: {
          83: { name: "Interior", description: "(inside of building)", image: "/placeholder.svg" },
          84: { name: "Exterior", description: "(building to outside)", image: "/placeholder.svg" }
        },
        order: [83, 84]
      },
      7: {
        title: "Fire Rating",
        columns: 3,
        required: true,
        options: {
          85: { name: "No", description: "", image: "/placeholder.svg" },
          86: { name: "20 Minute", description: "", image: "/placeholder.svg" },
          87: { name: "45 Minute", description: "", image: "/placeholder.svg" },
          88: { name: "60 Minute", description: "", image: "/placeholder.svg" },
          89: { name: "90 Minute", description: "", image: "/placeholder.svg" },
          90: { name: "3 Hour", description: "", image: "/placeholder.svg" }
        },
        conditions: [
          { when: { section: 6, options: [83] }, show: [85,86,87,88,89,90] }
        ],
        order: [85, 86, 87, 88, 89, 90]
      },
      8: {
        title: "Does this door need to be Embossed?",
        columns: 3,
        required: true,
        options: {
          91: { name: "No", description: "starting at $334", image: "/placeholder.svg", popular: true },
          92: { name: "6-Panel", description: "starting at $438", image: "/placeholder.svg" },
          93: { name: "2-Panel", description: "starting at $800", image: "/placeholder.svg" }
        },
        order: [91, 92, 93]
      },
      9: {
        title: "Does this door need a Lite Kit with Glass?",
        columns: 4,
        required: true,
        options: {
          94: { name: "No Lite Kit", description: "Solid door without glass", image: "/placeholder.svg" },
          95: { name: '12" x 12"', description: '10" x 10" Exposed Glass', image: "/placeholder.svg" },
          96: { name: '5" x 35"', description: '3" x 33" Exposed Glass', image: "/placeholder.svg" },
          97: { name: '6" x 27"', description: '4" x 25" Exposed Glass', image: "/placeholder.svg", popular: true },
          98: { name: '7" x 22"', description: '5" x 20" Exposed Glass', image: "/placeholder.svg" },
          99: { name: '8" x 32"', description: '6" x 30" Exposed Glass', image: "/placeholder.svg" },
          100: { name: "Long Narrow Lite", description: "Vertical narrow glass", image: "/placeholder.svg" },
          101: { name: "Half Glass", description: "Half door glass", image: "/placeholder.svg" },
          102: { name: "Full Glass", description: "Full door glass", image: "/placeholder.svg" },
          103: { name: "Full Glass w/Integral Rail", description: "Full glass with rail", image: "/placeholder.svg" }
        },
        order: [94, 95, 96, 97, 98, 99, 100, 101, 102, 103]
      },
      10: {
        title: "Does this door need a Louver?",
        columns: 4,
        required: true,
        options: {
          104: { name: "No Louver", description: "Standard door without louvers", image: "/placeholder.svg" },
          105: { name: '12" x 12"', description: "Square louver", image: "/placeholder.svg" },
          106: { name: '24" x 12"', description: "Rectangular louver", image: "/placeholder.svg" },
          107: { name: '24" x 18"', description: "Large rectangular louver", image: "/placeholder.svg" },
          108: { name: '24" x 24"', description: "Large square louver", image: "/placeholder.svg" },
          109: { name: "LL - Top and Bottom", description: "Two louvers top and bottom", image: "/placeholder.svg" },
          110: { name: "Full Louver", description: "Full door louver", image: "/placeholder.svg" }
        },
        order: [104, 105, 106, 107, 108, 109, 110]
      },
      13: {
        title: "Wall Construction Type",
        columns: 3,
        required: true,
        options: {
          103: { name: "Standard Drywall", description: "Standard interior wall construction", image: "/placeholder.svg" },
          104: { name: "Block Wall", description: "Masonry block construction", image: "/placeholder.svg" },
          105: { name: "Concrete Wall", description: "Poured concrete construction", image: "/placeholder.svg" }
        },
        conditions: [
          { when: { section: 1, options: [44] }, show: [103, 104, 105] }
        ],
        order: [103, 104, 105]
      },
      14: {
        title: "Select Hinge Type",
        columns: 3,
        required: true,
        options: {
          106: { name: "Standard Butt Hinges", description: "3 standard steel hinges", image: "/placeholder.svg", popular: true },
          107: { name: "Heavy Duty Hinges", description: "3 heavy duty steel hinges", image: "/placeholder.svg" },
          108: { name: "Continuous Hinges", description: "Full length piano hinge", image: "/placeholder.svg" }
        },
        order: [106, 107, 108]
      },
      15: {
        title: "Lock Function",
        columns: 4,
        required: true,
        options: {
          109: { name: "Passage", description: "No locking mechanism", image: "/placeholder.svg" },
          110: { name: "Privacy", description: "Interior privacy lock", image: "/placeholder.svg", popular: true },
          111: { name: "Entrance", description: "Keyed exterior lock", image: "/placeholder.svg" },
          112: { name: "Classroom", description: "Classroom security lock", image: "/placeholder.svg" },
          113: { name: "Storeroom", description: "Always locked from outside", image: "/placeholder.svg" },
          114: { name: "Deadbolt", description: "Keyed deadbolt lock", image: "/placeholder.svg" }
        },
        order: [109, 110, 111, 112, 113, 114]
      },
      16: {
        title: "Door Closer Required?",
        columns: 2,
        required: true,
        options: {
          115: { name: "No", description: "No automatic door closer", image: "/placeholder.svg" },
          116: { name: "Yes", description: "Automatic door closer", image: "/placeholder.svg" }
        },
        order: [115, 116]
      },
      17: {
        title: "Select Door Closer Type",
        columns: 3,
        required: true,
        options: {
          117: { name: "Surface Mount", description: "Closer mounted on door face", image: "/placeholder.svg" },
          118: { name: "Concealed Overhead", description: "Hidden in door frame", image: "/placeholder.svg" },
          119: { name: "Floor Spring", description: "Closer built into floor", image: "/placeholder.svg" }
        },
        conditions: [
          { when: { section: 16, options: [116] }, show: [117, 118, 119] }
        ],
        order: [117, 118, 119]
      },
      18: {
        title: "Hardware Finish",
        columns: 4,
        required: true,
        options: {
          130: { name: "Satin Chrome", description: "626 finish", image: "/placeholder.svg", popular: true },
          131: { name: "Polished Chrome", description: "625 finish", image: "/placeholder.svg" },
          132: { name: "Satin Stainless", description: "630 finish", image: "/placeholder.svg" },
          133: { name: "Oil Rubbed Bronze", description: "613 finish", image: "/placeholder.svg" },
          134: { name: "Bright Brass", description: "605 finish", image: "/placeholder.svg" },
          135: { name: "Antique Brass", description: "609 finish", image: "/placeholder.svg" }
        },
        order: [130, 131, 132, 133, 134, 135]
      },
      19: {
        title: "Hardware Grade",
        columns: 3,
        required: true,
        options: {
          136: { name: "Grade 1", description: "Heavy duty commercial grade", image: "/placeholder.svg" },
          137: { name: "Grade 2", description: "Standard commercial grade", image: "/placeholder.svg", popular: true },
          138: { name: "Grade 3", description: "Residential grade", image: "/placeholder.svg" }
        },
        order: [136, 137, 138]
      },
      25: {
        title: "Door Hinge & Lock Location",
        columns: 2,
        required: true,
        options: {
          141: { name: "Standard Location", description: "Lock at 36\" height, hinges at standard spacing", image: "/placeholder.svg" },
          142: { name: "Custom Location", description: "Specify custom hinge and lock placement", image: "/placeholder.svg" }
        },
        order: [141, 142]
      },
      26: {
        title: "Add Door Frame",
        columns: 2,
        required: true,
        options: {
          143: { name: "No Frame", description: "Door only without frame", image: "/placeholder.svg" },
          144: { name: "Include Frame", description: "Door with matching frame", image: "/placeholder.svg" }
        },
        conditions: [
          { when: { section: 1, options: [44] }, show: [143, 144] }
        ],
        order: [143, 144]
      },
      27: {
        title: "Has the wall been built yet?",
        columns: 2,
        required: true,
        options: {
          145: { name: "Yes", description: "Wall is already constructed", image: "/placeholder.svg" },
          146: { name: "No", description: "Wall will be built around frame", image: "/placeholder.svg" }
        },
        conditions: [
          { when: { section: 26, options: [144] }, show: [145, 146] }
        ],
        order: [145, 146]
      },
      28: {
        title: "What is the Wall Thickness?",
        columns: 4,
        required: true,
        options: {
          147: { name: '3-5/8"', description: "Standard 2x4 stud wall", image: "/placeholder.svg", popular: true },
          148: { name: '5-5/8"', description: "Standard 2x6 stud wall", image: "/placeholder.svg" },
          149: { name: '6"', description: "6 inch wall thickness", image: "/placeholder.svg" },
          150: { name: '8"', description: "8 inch block wall", image: "/placeholder.svg" },
          151: { name: "Other", description: "Custom wall thickness", customInput: true }
        },
        conditions: [
          { when: { section: 26, options: [144] }, show: [147, 148, 149, 150, 151] }
        ],
        order: [147, 148, 149, 150, 151]
      },
      29: {
        title: "What is the Rough Opening Size?",
        columns: 2,
        required: true,
        options: {
          152: { name: "Standard", description: "Standard rough opening for door size", image: "/placeholder.svg" },
          153: { name: "Custom", description: "Custom rough opening dimensions", image: "/placeholder.svg", customInput: true }
        },
        conditions: [
          { when: { section: 26, options: [144] }, show: [152, 153] }
        ],
        order: [152, 153]
      },
      30: {
        title: "What type of Anchor will be used?",
        columns: 4,
        required: true,
        options: {
          154: { name: "Masonry Anchors", description: "For block or concrete walls", image: "/placeholder.svg" },
          155: { name: "Wood Screws", description: "For wood stud walls", image: "/placeholder.svg", popular: true },
          156: { name: "Toggle Bolts", description: "For hollow walls", image: "/placeholder.svg" },
          157: { name: "Other", description: "Custom anchor type", image: "/placeholder.svg" }
        },
        conditions: [
          { when: { section: 26, options: [144] }, show: [154, 155, 156, 157] }
        ],
        order: [154, 155, 156, 157]
      },
      31: {
        title: "What is the Jamb Depth of the Frame?",
        columns: 4,
        required: true,
        options: {
          158: { name: '4-9/16"', description: "Standard residential jamb depth", image: "/placeholder.svg", popular: true },
          159: { name: '5-1/4"', description: "Commercial jamb depth", image: "/placeholder.svg" },
          160: { name: '6-5/8"', description: "Deep jamb for thick walls", image: "/placeholder.svg" },
          161: { name: "Other", description: "Custom jamb depth", image: "/placeholder.svg", customInput: true }
        },
        conditions: [
          { when: { section: 26, options: [144] }, show: [158, 159, 160, 161] }
        ],
        order: [158, 159, 160, 161]
      },
      32: {
        title: "KD or Welded Frame?",
        columns: 2,
        required: true,
        options: {
          162: { name: "KD Frame", description: "Knock-down frame (ships flat, assembled on site)", image: "/placeholder.svg", popular: true },
          163: { name: "Welded Frame", description: "Fully welded frame (ships assembled)", image: "/placeholder.svg" }
        },
        conditions: [
          { when: { section: 26, options: [144] }, show: [162, 163] }
        ],
        order: [162, 163]
      },
      33: {
        title: "Door Core Type",
        columns: 3,
        required: true,
        options: {
          164: { name: "Honeycomb Core", description: "Standard honeycomb core construction", image: "/placeholder.svg", popular: true },
          165: { name: "Mineral Core", description: "Fire-rated mineral core", image: "/placeholder.svg" },
          166: { name: "Steel Stiffened", description: "Steel reinforced core", image: "/placeholder.svg" }
        },
        order: [164, 165, 166]
      },
      34: {
        title: "Hang Door",
        columns: 2,
        required: true,
        options: {
          167: { name: "Factory Hung", description: "Door pre-hung in frame at factory", image: "/placeholder.svg", popular: true },
          168: { name: "Field Hung", description: "Door hung on site", image: "/placeholder.svg" }
        },
        conditions: [
          { when: { section: 26, options: [144] }, show: [167, 168] }
        ],
        order: [167, 168]
      },
      35: {
        title: "Latch Door",
        columns: 3,
        required: true,
        options: {
          169: { name: "Cylindrical Lock", description: "Standard cylindrical lockset", image: "/placeholder.svg", popular: true },
          170: { name: "Mortise Lock", description: "Commercial mortise lockset", image: "/placeholder.svg" },
          171: { name: "Exit Device", description: "Panic hardware/exit device", image: "/placeholder.svg" }
        },
        order: [169, 170, 171]
      },
      36: {
        title: "Mortise Lock Function",
        columns: 4,
        required: true,
        options: {
          172: { name: "Entrance", description: "Keyed both sides", image: "/placeholder.svg" },
          173: { name: "Office", description: "Key outside, turn inside", image: "/placeholder.svg", popular: true },
          174: { name: "Privacy", description: "Turn button inside", image: "/placeholder.svg" },
          175: { name: "Passage", description: "No locking", image: "/placeholder.svg" },
          176: { name: "Storeroom", description: "Always locked outside", image: "/placeholder.svg" },
          177: { name: "Classroom", description: "Key locks/unlocks outside", image: "/placeholder.svg" }
        },
        conditions: [
          { when: { section: 35, options: [170] }, show: [172, 173, 174, 175, 176, 177] }
        ],
        order: [172, 173, 174, 175, 176, 177]
      },
      37: {
        title: "Deadbolt Type",
        columns: 3,
        required: true,
        options: {
          178: { name: "Single Cylinder", description: "Key outside, turn inside", image: "/placeholder.svg", popular: true },
          179: { name: "Double Cylinder", description: "Key both sides", image: "/placeholder.svg" },
          180: { name: "No Deadbolt", description: "Lockset only", image: "/placeholder.svg" }
        },
        conditions: [
          { when: { section: 35, options: [169] }, show: [178, 179, 180] }
        ],
        order: [178, 179, 180]
      },
      38: {
        title: "Outside Exit Device Trim",
        columns: 4,
        required: true,
        options: {
          181: { name: "Pull Handle", description: "Standard pull handle trim", image: "/placeholder.svg", popular: true },
          182: { name: "Lever Trim", description: "Lever handle trim", image: "/placeholder.svg" },
          183: { name: "Cylinder Pull", description: "Keyed cylinder with pull", image: "/placeholder.svg" },
          184: { name: "No Trim", description: "Inside exit device only", image: "/placeholder.svg" }
        },
        conditions: [
          { when: { section: 35, options: [171] }, show: [181, 182, 183, 184] }
        ],
        order: [181, 182, 183, 184]
      },
      39: {
        title: "Exit Device Trim Function",
        columns: 3,
        required: true,
        options: {
          185: { name: "Non-Locking", description: "Always unlocked from outside", image: "/placeholder.svg" },
          186: { name: "Key Override", description: "Key can lock/unlock outside", image: "/placeholder.svg", popular: true },
          187: { name: "Double Cylinder", description: "Key required both sides", image: "/placeholder.svg" }
        },
        conditions: [
          { when: { section: 38, options: [181, 182, 183] }, show: [185, 186, 187] }
        ],
        order: [185, 186, 187]
      },
      40: {
        title: "Control Door",
        columns: 2,
        required: true,
        options: {
          188: { name: "Active Door", description: "Main operating door", image: "/placeholder.svg", popular: true },
          189: { name: "Inactive Door", description: "Secondary door (flush bolts)", image: "/placeholder.svg" }
        },
        conditions: [
          { when: { section: 2, options: [47] }, show: [188, 189] }
        ],
        order: [188, 189]
      },
      41: {
        title: "Protect Door",
        columns: 4,
        required: false,
        options: {
          190: { name: "Weatherstripping", description: "Door perimeter sealing", image: "/placeholder.svg" },
          191: { name: "Door Sweep", description: "Bottom door seal", image: "/placeholder.svg" },
          192: { name: "Threshold", description: "Door sill/threshold", image: "/placeholder.svg" },
          193: { name: "Latch Guard", description: "Security latch protection", image: "/placeholder.svg" },
          194: { name: "Kick Plate", description: "Bottom door protection", image: "/placeholder.svg" },
          195: { name: "Push/Pull Plate", description: "Door push plate", image: "/placeholder.svg" }
        },
        conditions: [
          { when: { section: 6, options: [84] }, show: [190, 191, 192] }
        ],
        order: [190, 191, 192, 193, 194, 195],
        multiSelect: true
      },
      42: {
        title: "Add On's",
        columns: 4,
        required: false,
        options: {
          196: { name: "Door Viewer", description: "Peephole for vision", image: "/placeholder.svg" },
          197: { name: "Door Knocker", description: "Traditional door knocker", image: "/placeholder.svg" },
          198: { name: "House Numbers", description: "Address numbering", image: "/placeholder.svg" },
          199: { name: "Door Bell", description: "Entry doorbell", image: "/placeholder.svg" },
          200: { name: "Mail Slot", description: "Mail delivery slot", image: "/placeholder.svg" },
          201: { name: "Name Plate", description: "Custom name/title plate", image: "/placeholder.svg" }
        },
        order: [196, 197, 198, 199, 200, 201],
        multiSelect: true
      },
      43: {
        title: "Hardware Brand",
        columns: 4,
        required: true,
        options: {
          202: { name: "Schlage", description: "Premium hardware brand", image: "/placeholder.svg", popular: true },
          203: { name: "Yale", description: "Security hardware specialist", image: "/placeholder.svg" },
          204: { name: "Kwikset", description: "Residential hardware brand", image: "/placeholder.svg" },
          205: { name: "Falcon", description: "Commercial grade hardware", image: "/placeholder.svg" },
          206: { name: "Corbin Russwin", description: "Heavy duty commercial", image: "/placeholder.svg" },
          207: { name: "Other", description: "Specify custom brand", image: "/placeholder.svg", customInput: true }
        },
        order: [202, 203, 204, 205, 206, 207]
      },
      44: {
        title: "Door Prep",
        columns: 3,
        required: true,
        options: {
          208: { name: "Standard Prep", description: "Standard drilling and routing", image: "/placeholder.svg", popular: true },
          209: { name: "Custom Prep", description: "Custom hardware preparation", image: "/placeholder.svg" },
          210: { name: "Field Prep", description: "Prepare hardware on site", image: "/placeholder.svg" }
        },
        order: [208, 209, 210]
      }
    },

    // Wood Door (20) sections - simplified selection
    20: {
      1: {
        title: "Single or Double Door",
        columns: 2,
        required: true,
        options: {
          233: { name: "Single Door", description: "", image: "/placeholder.svg" },
          234: { name: "Double Door", description: "", image: "/placeholder.svg" }
        },
        order: [233, 234]
      },
      2: {
        title: "Door Width",
        columns: 4,
        required: true,
        options: {
          235: { name: '2\'4"', description: "28 inch - 27-3/4\" Actual Size", popular: false },
          236: { name: '2\'6"', description: "30 inch - 29-3/4\" Actual Size", popular: false },
          238: { name: '3\'0"', description: "36 inch - 35-3/4\" Actual Size", popular: true },
          244: { name: '6\'0"', description: "two 36 inch doors - Each Door 35-3/4\" Actual Size", popular: true }
        },
        conditions: [
          { when: { section: 1, options: [233] }, show: [235,236,238] },
          { when: { section: 1, options: [234] }, show: [244] }
        ],
        order: [235, 236, 238, 244]
      },
      3: {
        title: "Door Surface",
        columns: 4,
        required: true,
        options: {
          278: { name: "Clear White Birch", description: "Rotary White Birch Veneer - Starting at $425", image: "/placeholder.svg" },
          279: { name: "Clear Oak", description: "Plain Sliced Red Oak Veneer - Starting at $405", image: "/placeholder.svg" },
          282: { name: "Primed White", description: "Paint Grade - Starting at $205", popular: true, image: "/placeholder.svg" },
          283: { name: "Economy Prefinished", description: "Painted Edges, 3 Color Options - Starting at $300", image: "/placeholder.svg" }
        },
        order: [278, 279, 282, 283]
      }
    },

    // Metal Building Door (30) sections  
    30: {
      1: {
        title: "Select a Door System",
        columns: 3,
        required: true,
        options: {
          190: { name: '3\'0" x 7\'0"', description: "Single Door System (Preassembled & Prefinished) Starting at $1084", image: "/placeholder.svg" },
          191: { name: '4\'0" x 7\'0"', description: "Single Door System (Preassembled & Prefinished) Starting at $1274", image: "/placeholder.svg" },
          192: { name: '6\'0" x 7\'0"', description: "Double Door System (Preassembled & Prefinished) Starting at $1999", image: "/placeholder.svg" }
        },
        order: [190, 191, 192]
      },
      2: {
        title: "Door Hand",
        columns: 4,
        required: true,
        options: {
          193: { name: "LHR", description: "Left Hand Reverse", image: "/placeholder.svg" },
          194: { name: "LH", description: "Left Hand", image: "/placeholder.svg" },
          195: { name: "RH", description: "Right Hand", image: "/placeholder.svg" },
          196: { name: "RHR", description: "Right Hand Reverse", image: "/placeholder.svg" }
        },
        conditions: [
          { when: { section: 1, options: [190,191] }, show: [193,194,195,196] }
        ],
        order: [193, 194, 195, 196]
      },
      3: {
        title: "Finish",
        columns: 2,
        required: true,
        options: {
          217: { name: "White", description: "", image: "/placeholder.svg" },
          218: { name: "Bronze", description: "", image: "/placeholder.svg" }
        },
        order: [217, 218]
      }
    }
  }
}

// Helper functions for working with the config
export function getProductTypes() {
  return Object.entries(quoteConfig.types).map(([id, name]) => ({
    id: parseInt(id),
    name,
    description: quoteConfig.typeDescriptions[id] || '',
    image: quoteConfig.typeImages[id] || '/placeholder.svg'
  }))
}

export function getSectionsForProduct(productId) {
  const sections = quoteConfig.sections[productId]
  if (!sections) return []
  
  return Object.entries(sections).map(([id, section]) => ({
    id: parseInt(id),
    ...section
  })).sort((a, b) => a.id - b.id)
}

export function checkConditions(section, selections) {
  if (!section.conditions) return true
  
  return section.conditions.some(condition => {
    const { when } = condition
    const selection = selections[when.section]
    if (!selection) return false
    
    return when.options.some(optionId => selection.includes(optionId))
  })
}

export function getVisibleOptions(section, selections) {
  if (!section.conditions) return section.options
  
  const visibleOptionIds = new Set()
  
  // Check each condition
  section.conditions.forEach(condition => {
    if (checkConditions({ conditions: [condition] }, selections)) {
      condition.show.forEach(optionId => visibleOptionIds.add(optionId))
    }
  })
  
  // If no conditions matched, show all options
  if (visibleOptionIds.size === 0) {
    return section.options
  }
  
  // Filter options to only show visible ones
  const visibleOptions = {}
  Object.entries(section.options).forEach(([id, option]) => {
    if (visibleOptionIds.has(parseInt(id))) {
      visibleOptions[id] = option
    }
  })
  
  return visibleOptions
}