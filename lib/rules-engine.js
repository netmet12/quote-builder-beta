import { Engine } from 'json-rules-engine'

/**
 * Rules Engine for Quote Builder
 * Manages complex conditional logic for showing/hiding sections and options
 */

export class QuoteRulesEngine {
  constructor() {
    this.engine = new Engine()
    this.setupRules()
  }

  setupRules() {
    // Rule: Show door hand options only for single doors
    this.engine.addRule({
      conditions: {
        all: [
          {
            fact: 'selection',
            path: '$.2',
            operator: 'in',
            value: [46] // Single Door
          }
        ]
      },
      event: {
        type: 'show-section',
        params: {
          sectionId: 5,
          options: [72, 73, 74, 75]
        }
      }
    })

    // Rule: Show "Which Door is Active" only for double doors
    this.engine.addRule({
      conditions: {
        all: [
          {
            fact: 'selection',
            path: '$.2',
            operator: 'in',
            value: [47] // Double Door
          }
        ]
      },
      event: {
        type: 'show-section',
        params: {
          sectionId: 24,
          options: [139, 140]
        }
      }
    })

    // Rule: Show door width options based on single/double selection
    this.engine.addRule({
      conditions: {
        all: [
          {
            fact: 'selection',
            path: '$.2',
            operator: 'in',
            value: [46] // Single Door
          }
        ]
      },
      event: {
        type: 'show-section',
        params: {
          sectionId: 3,
          options: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57]
        }
      }
    })

    this.engine.addRule({
      conditions: {
        all: [
          {
            fact: 'selection',
            path: '$.2',
            operator: 'in',
            value: [47] // Double Door
          }
        ]
      },
      event: {
        type: 'show-section',
        params: {
          sectionId: 3,
          options: [58, 60, 61, 63, 65, 67]
        }
      }
    })

    // Rule: Show fire rating options only for interior doors
    this.engine.addRule({
      conditions: {
        all: [
          {
            fact: 'selection',
            path: '$.6',
            operator: 'in',
            value: [83] // Interior
          }
        ]
      },
      event: {
        type: 'show-section',
        params: {
          sectionId: 7,
          options: [85, 86, 87, 88, 89, 90]
        }
      }
    })

    // Rule: Show glass type selection only when lite kit is selected
    this.engine.addRule({
      conditions: {
        all: [
          {
            fact: 'selection',
            path: '$.9',
            operator: 'in',
            value: [94] // Yes to Lite Kit
          }
        ]
      },
      event: {
        type: 'show-section',
        params: {
          sectionId: 10,
          options: [95, 96, 97]
        }
      }
    })

    // Rule: Show louver size only when louvers are selected
    this.engine.addRule({
      conditions: {
        all: [
          {
            fact: 'selection',
            path: '$.11',
            operator: 'in',
            value: [99] // Yes to Louvers
          }
        ]
      },
      event: {
        type: 'show-section',
        params: {
          sectionId: 12,
          options: [100, 101, 102]
        }
      }
    })

    // Rule: Show frame-related sections only when frame is included
    this.engine.addRule({
      conditions: {
        all: [
          {
            fact: 'selection',
            path: '$.26',
            operator: 'in',
            value: [144] // Include Frame
          }
        ]
      },
      event: {
        type: 'show-multiple-sections',
        params: {
          sections: [27, 28, 29, 30, 31, 32, 34] // Wall built, thickness, opening, anchor, jamb depth, KD/welded, hang door
        }
      }
    })

    // Rule: Show mortise lock functions only when mortise lock is selected
    this.engine.addRule({
      conditions: {
        all: [
          {
            fact: 'selection',
            path: '$.35',
            operator: 'in',
            value: [170] // Mortise Lock
          }
        ]
      },
      event: {
        type: 'show-section',
        params: {
          sectionId: 36,
          options: [172, 173, 174, 175, 176, 177]
        }
      }
    })

    // Rule: Show deadbolt options only for cylindrical locks
    this.engine.addRule({
      conditions: {
        all: [
          {
            fact: 'selection',
            path: '$.35',
            operator: 'in',
            value: [169] // Cylindrical Lock
          }
        ]
      },
      event: {
        type: 'show-section',
        params: {
          sectionId: 37,
          options: [178, 179, 180]
        }
      }
    })

    // Rule: Show exit device trim only for exit devices
    this.engine.addRule({
      conditions: {
        all: [
          {
            fact: 'selection',
            path: '$.35',
            operator: 'in',
            value: [171] // Exit Device
          }
        ]
      },
      event: {
        type: 'show-section',
        params: {
          sectionId: 38,
          options: [181, 182, 183, 184]
        }
      }
    })

    // Rule: Show exit device trim function only when trim is selected
    this.engine.addRule({
      conditions: {
        all: [
          {
            fact: 'selection',
            path: '$.38',
            operator: 'in',
            value: [181, 182, 183] // Pull Handle, Lever Trim, Cylinder Pull
          }
        ]
      },
      event: {
        type: 'show-section',
        params: {
          sectionId: 39,
          options: [185, 186, 187]
        }
      }
    })

    // Rule: Show control door only for double doors
    this.engine.addRule({
      conditions: {
        all: [
          {
            fact: 'selection',
            path: '$.2',
            operator: 'in',
            value: [47] // Double Door
          }
        ]
      },
      event: {
        type: 'show-section',
        params: {
          sectionId: 40,
          options: [188, 189]
        }
      }
    })

    // Rule: Show weather protection options only for exterior doors
    this.engine.addRule({
      conditions: {
        all: [
          {
            fact: 'selection',
            path: '$.6',
            operator: 'in',
            value: [84] // Exterior
          }
        ]
      },
      event: {
        type: 'show-section',
        params: {
          sectionId: 41,
          options: [190, 191, 192] // Weatherstripping, Door Sweep, Threshold
        }
      }
    })
  }

  /**
   * Evaluate rules for current selections and return visible sections/options
   */
  async evaluateVisibility(selections) {
    const facts = {
      selection: selections
    }

    const { events } = await this.engine.run(facts)
    
    const visibility = {
      sections: {},
      options: {}
    }

    events.forEach(event => {
      switch (event.type) {
        case 'show-section':
          visibility.sections[event.params.sectionId] = true
          if (!visibility.options[event.params.sectionId]) {
            visibility.options[event.params.sectionId] = new Set()
          }
          event.params.options.forEach(optionId => {
            visibility.options[event.params.sectionId].add(optionId)
          })
          break
          
        case 'show-multiple-sections':
          event.params.sections.forEach(sectionId => {
            visibility.sections[sectionId] = true
          })
          break
      }
    })

    // Convert Sets back to arrays for easier consumption
    Object.keys(visibility.options).forEach(sectionId => {
      visibility.options[sectionId] = Array.from(visibility.options[sectionId])
    })

    return visibility
  }

  /**
   * Check if a section should be visible
   */
  async isSectionVisible(sectionId, selections) {
    const visibility = await this.evaluateVisibility(selections)
    return visibility.sections[sectionId] || false
  }

  /**
   * Get visible options for a section
   */
  async getVisibleOptions(sectionId, selections) {
    const visibility = await this.evaluateVisibility(selections)
    return visibility.options[sectionId] || []
  }
}

// Create singleton instance
export const rulesEngine = new QuoteRulesEngine()