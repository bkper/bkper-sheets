
var expect = require('chai').expect;

describe('Formula', () => {

  describe('#isBkperFormula()', () => {
    
    it('should be true only for BKPER formulas', () => {
      expect(Formula.isBkperFormula('xxx')).to.eql(false);
      expect(Formula.isBkperFormula('=SUM')).to.eql(false);
      expect(Formula.isBkperFormula('= SUM')).to.eql(false);
      expect(Formula.isBkperFormula('=BKPER_TRANSACTIONS(xxx')).to.eql(true);
      expect(Formula.isBkperFormula(' = BKPER_BALANCES_TOTAL(xxx')).to.eql(true);
      expect(Formula.isBkperFormula(' = BKPER_BALANCES_TRIAL(xxx')).to.eql(true);
      expect(Formula.isBkperFormula(' = BKPER_ACCOUNTS(xxx')).to.eql(true);
      expect(Formula.isBkperFormula('=BKPER_GROUPS(xxx')).to.eql(true);
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
      properties: true,
      ids: true,
      lastUpdate: 1121
    }

    it('should parse transactions', () => {
      expect(Formula.parseFetchStatement(fetchStatement, 'pt_BR').toString()).to.eql('=BKPER_TRANSACTIONS("xxx"; 1; "yyy"; TRUE; TRUE)');
    })

    it('should replace query double quotes', () => {
      fetchStatement.query = 'acc: "some account"'
      expect(Formula.parseFetchStatement(fetchStatement, 'en_US').toString()).to.eql('=BKPER_TRANSACTIONS("xxx", 1, "acc: \'some account\'", TRUE, TRUE)');
    })
    
    it('should parse accounts', () => {
      fetchStatement.fetchType = "accounts";
      expect(Formula.parseFetchStatement(fetchStatement, 'pt_BR').toString()).to.eql('=BKPER_ACCOUNTS("xxx"; 1; FALSE; TRUE)');
    })

    it('should parse groups', () => {
      fetchStatement.fetchType = "groups";
      expect(Formula.parseFetchStatement(fetchStatement, 'pt_BR').toString()).to.eql('=BKPER_GROUPS("xxx"; 1; TRUE)');
    })
    
    it('should parse balances query', () => {
      fetchStatement.fetchType = "balances";
      fetchStatement.balanceType = 'CUMULATIVE'
      expect(Formula.parseFetchStatement(fetchStatement, 'pt_BR').toString()).to.eql('=BKPER_BALANCES_CUMULATIVE("xxx"; 1; "acc: \'some account\'"; TRUE; FALSE; FALSE)');
      fetchStatement.balanceType = 'PERIOD'
      expect(Formula.parseFetchStatement(fetchStatement, 'en_US').toString()).to.eql('=BKPER_BALANCES_PERIOD("xxx", 1, "acc: \'some account\'", TRUE, FALSE, FALSE)');
      fetchStatement.balanceType = 'TOTAL'
      expect(Formula.parseFetchStatement(fetchStatement, 'pt_BR').toString()).to.eql('=BKPER_BALANCES_TOTAL("xxx"; 1; "acc: \'some account\'"; TRUE; FALSE; FALSE)');
      fetchStatement.balanceType = 'TRIAL'
      expect(Formula.parseFetchStatement(fetchStatement, 'pt_BR').toString()).to.eql('=BKPER_BALANCES_TRIAL("xxx"; 1; "acc: \'some account\'"; TRUE; FALSE; FALSE)');
    })

  
  });  

  describe('#parseString()', () => {

    it('should parse accounts', () => {
      expect(Formula.parseString('= BKPER_ACCOUNTS("xxx"; 1)', 'pt_BR').toString()).to.eql('=BKPER_ACCOUNTS("xxx"; 1; TRUE; FALSE)');
      expect(Formula.parseString('= BKPER_ACCOUNTS("xxx"; 1; TRUE; TRUE)', 'pt_BR').toString()).to.eql('=BKPER_ACCOUNTS("xxx"; 1; TRUE; TRUE)');
    })

    it('should parse groups', () => {
      expect(Formula.parseString('= BKPER_GROUPS("xxx"; 1)', 'pt_BR').toString()).to.eql('=BKPER_GROUPS("xxx"; 1; FALSE)');
      expect(Formula.parseString('= BKPER_GROUPS("xxx"; 1; FALSE)', 'pt_BR').toString()).to.eql('=BKPER_GROUPS("xxx"; 1; FALSE)');
      expect(Formula.parseString('= BKPER_GROUPS("xxx"; 1; TRUE)', 'pt_BR').toString()).to.eql('=BKPER_GROUPS("xxx"; 1; TRUE)');
    })

    it('should parse transactions', () => {
      expect(Formula.parseString('= BKPER_TRANSACTIONS("xxx"; 1; "yyy"; TRUE; FALSE)', 'pt_BR').toString()).to.eql('=BKPER_TRANSACTIONS("xxx"; 1; "yyy"; TRUE; FALSE)');
    })

    it('should replace query double quotes', () => {
      expect(Formula.parseString('=BKPER_TRANSACTIONS("xxx"; 1; "acc: \'some account\'"; TRUE; true)', 'en_US').toString()).to.eql('=BKPER_TRANSACTIONS("xxx", 1, "acc: \'some account\'", TRUE, TRUE)');
    })
    
    it('should parse balances query', () => {
      expect(Formula.parseString('=BKPER_BALANCES_CUMULATIVE("xxx", 1, "acc: \'some account\'"; FALSE; TRUE; TRUE) ', 'en_US').toString()).to.eql('=BKPER_BALANCES_CUMULATIVE("xxx", 1, "acc: \'some account\'", FALSE, TRUE, TRUE)');
      expect(Formula.parseString(' =BKPER_BALANCES_PERIOD("xxx"; 1; "acc: \'some account\'"; false; false; false)', 'pt_BR').toString()).to.eql('=BKPER_BALANCES_PERIOD("xxx"; 1; "acc: \'some account\'"; FALSE; FALSE; FALSE)');
      expect(Formula.parseString('=  BKPER_BALANCES_TOTAL("xxx"; 1; "acc: \'some account\'"; true, FALSE, TRUE)', 'pt_BR').toString()).to.eql('=BKPER_BALANCES_TOTAL("xxx"; 1; "acc: \'some account\'"; TRUE; FALSE; TRUE)');
      expect(Formula.parseString('=  BKPER_BALANCES_TRIAL("xxx"; 1; "acc: \'some account\'"; true, FALSE, TRUE)', 'pt_BR').toString()).to.eql('=BKPER_BALANCES_TRIAL("xxx"; 1; "acc: \'some account\'"; TRUE; FALSE; TRUE)');
    })

    it('should preserve references', () => {
      expect(Formula.parseString('= BKPER_TRANSACTIONS(H1; 1; H3)', 'pt_BR').toString()).to.eql('=BKPER_TRANSACTIONS(H1; 1; H3; FALSE; FALSE)');
      expect(Formula.parseString('= BKPER_TRANSACTIONS(H1; 1; H3; G3; FALSE)', 'pt_BR').toString()).to.eql('=BKPER_TRANSACTIONS(H1; 1; H3; G3; FALSE)');
    })

    it('should not parse comma inside quotes', () => {
      expect(Formula.parseString('=BKPER_TRANSACTIONS(H1; 1; "account: \'Account, bla\'")', 'pt_BR').toString()).to.eql('=BKPER_TRANSACTIONS(H1; 1; "account: \'Account, bla\'"; FALSE; FALSE)');
      expect(Formula.parseString(' =BKPER_BALANCES_PERIOD("xxx"; 1; "acc: \'some, account\'"; false; false; false)', 'pt_BR').toString()).to.eql('=BKPER_BALANCES_PERIOD("xxx"; 1; "acc: \'some, account\'"; FALSE; FALSE; FALSE)');
    })

    it('should preserve inner formulas', () => {
      expect(Formula.parseString('=BKPER_BALANCES_PERIOD(\'Configuração\'!$C$5, 21, "group:\'Receita Provedores Regionais\' after:"&TEXT(\'Configuração\'!$C$6, "mm/yyyy")&" before:"&TEXT(\'Configuração\'!$C$7, "mm/yyyy"), FALSE, TRUE, TRUE)', 'en_US')
      .toString()).to.eql('=BKPER_BALANCES_PERIOD(\'Configuração\'!$C$5, 21, "group:\'Receita Provedores Regionais\' after:"&TEXT(\'Configuração\'!$C$6, "mm/yyyy")&" before:"&TEXT(\'Configuração\'!$C$7, "mm/yyyy"), FALSE, TRUE, TRUE)');
    })
  
  });  
});



