
var expect = require('chai').expect;

describe('Utilities_', () => {
  describe('#removeEmptyRowsAtEnd()', () => {
    
    var toTrim = [
      ["date",       "description", "debit", "credit"],
      ["25/01/1983", "descrition1", "22,00", "      "],
      ["25/01/1983", "descrition2", "23,45", ""      ],
      ["25/01/1983", "descrition2", ""     , "23,55" ],
      [""          , ""           , null   , "    "  ],
      [""          , ""           , null   , "    "  ],
      [null        , null         , null   , null    ]
    ];
      
    var expected = [
      ["date",       "description", "debit", "credit"],
      ["25/01/1983", "descrition1", "22,00", "      "],
      ["25/01/1983", "descrition2", "23,45", ""      ],
      ["25/01/1983", "descrition2", ""     , "23,55" ]
    ];

    it('should remove empty rows with null or empty', () => {
      expect(expected).to.eql(Utilities_.removeEmptyRowsAtEnd(toTrim));
    })
    
    it('should work with empty row function', () => {
      
      toTrim = [
        ["date",       "description", "debit", "credit"],
        ["25/01/1983", "descrition1", "22,00", "      "],
        ["25/01/1983", "descrition2", "23,45", ""      ],
        ["25/01/1983", "descrition2", ""     , "23,55" ],
        [""          , ""           , null   , "    "  ],
        [""          , ""           , null   , "    "  ],
        [null        , null         , null   , null    ]
      ];
      
      var isRowEmptyFunc = function(row:any[]) {
        return row.join("").trim() == "";
      };
      
      expect(expected).to.eql(Utilities_.removeEmptyRowsAtEnd(toTrim, isRowEmptyFunc));
    })

    it('should work with single line matrix', () => {
      toTrim = [
        ["date",       "description", "debit", "credit"]
      ];
        
      expected = [
        ["date",       "description", "debit", "credit"],
      ];
      expect(expected).to.eql(Utilities_.removeEmptyRowsAtEnd(toTrim));
    })

    it('should work with single empty line', () => {
      toTrim = [
        ["",       "", "", ""]
      ];
        
      expected = [
        
      ];
      expect(expected).to.eql(Utilities_.removeEmptyRowsAtEnd(toTrim));
    })
  
  });
});



