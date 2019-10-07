
var expect = require('chai').expect;

describe('Formula', () => {
  describe('#isBkperFormula()', () => {
    
    it('should be true only for BKPER formulas', () => {
      expect(Formula.isBkperFormula('xxx')).to.eql(false);
      expect(Formula.isBkperFormula('=SUM')).to.eql(false);
      expect(Formula.isBkperFormula('= SUM')).to.eql(false);
      expect(Formula.isBkperFormula('=BKPER_TRANSACTIONS(xxx')).to.eql(true);
      expect(Formula.isBkperFormula(' = BKPER_BALANCES_TOTAL(xxx')).to.eql(true);
    })
  
  });

  describe('#parseFetchStatement()', () => {
    let fetchStatement: FetchStatement = {
      ledgerId: "xxx",
      query: "yyy",
      rangeName: "zzz",
      fetchType: "transactions",
      expanded: true,
      transposed: undefined,
      lastUpdate: 1121
    }

    it('should parse transactions', () => {
      expect(Formula.parseFetchStatement(fetchStatement, 'pt_BR').toString()).to.eql('=BKPER_TRANSACTIONS("xxx"; 1; "yyy")');
    })

    it('should replace query double quotes', () => {
      fetchStatement.query = 'acc: "some account"'
      expect(Formula.parseFetchStatement(fetchStatement, 'en_US').toString()).to.eql('=BKPER_TRANSACTIONS("xxx", 1, "acc: \'some account\'")');
    })
    
    it('should parse balances query', () => {
      fetchStatement.fetchType = "balances";
      fetchStatement.balanceType = 'CUMULATIVE'
      expect(Formula.parseFetchStatement(fetchStatement, 'pt_BR').toString()).to.eql('=BKPER_BALANCES_CUMULATIVE("xxx"; 1; "acc: \'some account\'"; true; false)');
      fetchStatement.balanceType = 'PERIOD'
      expect(Formula.parseFetchStatement(fetchStatement, 'en_US').toString()).to.eql('=BKPER_BALANCES_PERIOD("xxx", 1, "acc: \'some account\'", true, false)');
      fetchStatement.balanceType = 'TOTAL'
      expect(Formula.parseFetchStatement(fetchStatement, 'pt_BR').toString()).to.eql('=BKPER_BALANCES_TOTAL("xxx"; 1; "acc: \'some account\'"; true; false)');
    })
  
  });  

  describe('#parseString()', () => {
    it('should parse transactions', () => {
      expect(Formula.parseString('= BKPER_TRANSACTIONS("xxx"; 1; "yyy"; TRUE; FALSE)', 'pt_BR').toString()).to.eql('=BKPER_TRANSACTIONS("xxx"; 1; "yyy")');
    })

    it('should replace query double quotes', () => {
      expect(Formula.parseString('=BKPER_TRANSACTIONS("xxx"; 1; "acc: \'some account\'"; TRUE; true)', 'en_US').toString()).to.eql('=BKPER_TRANSACTIONS("xxx", 1, "acc: \'some account\'")');
    })
    
    it('should parse balances query', () => {
      expect(Formula.parseString('=BKPER_BALANCES_CUMULATIVE("xxx", 1, "acc: \'some account\'"; FALSE; TRUE) ', 'en_US').toString()).to.eql('=BKPER_BALANCES_CUMULATIVE("xxx", 1, "acc: \'some account\'", false, true)');
      expect(Formula.parseString(' =BKPER_BALANCES_PERIOD("xxx"; 1; "acc: \'some account\'"; false; false)', 'pt_BR').toString()).to.eql('=BKPER_BALANCES_PERIOD("xxx"; 1; "acc: \'some account\'"; false; false)');
      expect(Formula.parseString('=  BKPER_BALANCES_TOTAL("xxx"; 1; "acc: \'some account\'")', 'pt_BR').toString()).to.eql('=BKPER_BALANCES_TOTAL("xxx"; 1; "acc: \'some account\'"; false; false)');
    })

    it('should preserve references', () => {
      expect(Formula.parseString('= BKPER_TRANSACTIONS(H1; 1; H3)', 'pt_BR').toString()).to.eql('=BKPER_TRANSACTIONS(H1; 1; H3)');
    })
  
  });  
});



