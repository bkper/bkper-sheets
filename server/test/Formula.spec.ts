
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
      lastUpdate: 1121
    }

    it('should parse transactions', () => {
      expect(Formula.parseFetchStatement(fetchStatement).toString()).to.eql('=BKPER_TRANSACTIONS(0, "xxx", "yyy")');
    })

    it('should replace query double quotes', () => {
      fetchStatement.query = 'acc: "some account"'
      expect(Formula.parseFetchStatement(fetchStatement).toString()).to.eql('=BKPER_TRANSACTIONS(0, "xxx", "acc: \'some account\'")');
    })
    
    it('should parse balances query', () => {
      fetchStatement.fetchType = "balances";
      fetchStatement.balanceType = 'CUMULATIVE'
      expect(Formula.parseFetchStatement(fetchStatement).toString()).to.eql('=BKPER_BALANCES_CUMULATIVE(0, "xxx", "acc: \'some account\'")');
      fetchStatement.balanceType = 'PERIOD'
      expect(Formula.parseFetchStatement(fetchStatement).toString()).to.eql('=BKPER_BALANCES_PERIOD(0, "xxx", "acc: \'some account\'")');
      fetchStatement.balanceType = 'TOTAL'
      expect(Formula.parseFetchStatement(fetchStatement).toString()).to.eql('=BKPER_BALANCES_TOTAL(0, "xxx", "acc: \'some account\'")');
    })
  
  });  

  describe('#parseString()', () => {
    it('should parse transactions', () => {
      expect(Formula.parseString('= BKPER_TRANSACTIONS(0, "xxx", "yyy")').toString()).to.eql('=BKPER_TRANSACTIONS(0, "xxx", "yyy")');
    })

    it('should replace query double quotes', () => {
      expect(Formula.parseString('=BKPER_TRANSACTIONS(0, "xxx", "acc: \'some account\'")').toString()).to.eql('=BKPER_TRANSACTIONS(0, "xxx", "acc: \'some account\'")');
    })
    
    it('should parse balances query', () => {
      expect(Formula.parseString('=BKPER_BALANCES_CUMULATIVE(0, "xxx", "acc: \'some account\'") ').toString()).to.eql('=BKPER_BALANCES_CUMULATIVE(0, "xxx", "acc: \'some account\'")');
      expect(Formula.parseString(' =BKPER_BALANCES_PERIOD(0, "xxx", "acc: \'some account\'")').toString()).to.eql('=BKPER_BALANCES_PERIOD(0, "xxx", "acc: \'some account\'")');
      expect(Formula.parseString('=  BKPER_BALANCES_TOTAL(0, "xxx", "acc: \'some account\'")').toString()).to.eql('=BKPER_BALANCES_TOTAL(0, "xxx", "acc: \'some account\'")');
    })

    it('should preserve references', () => {
      expect(Formula.parseString('= BKPER_TRANSACTIONS(0, H1, H3)').toString()).to.eql('=BKPER_TRANSACTIONS(0, H1, H3)');
    })
  
  });  
});



