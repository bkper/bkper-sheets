
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
      lastUpdate: 1121
    }

    it('should parse transactions', () => {
      expect(Formula.parseFetchStatement(fetchStatement, 'pt_BR').toString()).to.eql('=BKPER_TRANSACTIONS("xxx"; 1; "yyy")');
      expect(Formula.parseFetchStatement(fetchStatement, 'pt_BR').toJavascript()).to.eql('BKPER_TRANSACTIONS("xxx", 1, "yyy")');
    })

    it('should replace query double quotes', () => {
      fetchStatement.query = 'acc: "some account"'
      expect(Formula.parseFetchStatement(fetchStatement, 'en_US').toString()).to.eql('=BKPER_TRANSACTIONS("xxx", 1, "acc: \'some account\'")');
    })
    
    it('should parse accounts', () => {
      fetchStatement.fetchType = "accounts";
      expect(Formula.parseFetchStatement(fetchStatement, 'pt_BR').toString()).to.eql('=BKPER_ACCOUNTS("xxx"; 1)');
    })

    it('should parse accounts with group filter', () => {
      fetchStatement.fetchType = "accounts";
      fetchStatement.query = "group:'Assets'";
      expect(Formula.parseFetchStatement(fetchStatement, 'pt_BR').toString()).to.eql('=BKPER_ACCOUNTS("xxx"; 1; "Assets")');
      expect(Formula.parseFetchStatement(fetchStatement, 'en_US').toString()).to.eql('=BKPER_ACCOUNTS("xxx", 1, "Assets")');
      expect(Formula.parseFetchStatement(fetchStatement, 'en_US').toJavascript()).to.eql('BKPER_ACCOUNTS("xxx", 1, "Assets")');
      // Reset query for next tests (balances test expects this format)
      fetchStatement.query = 'acc: "some account"';
    })

    it('should parse groups', () => {
      fetchStatement.fetchType = "groups";
      expect(Formula.parseFetchStatement(fetchStatement, 'pt_BR').toString()).to.eql('=BKPER_GROUPS("xxx"; 1)');
    })
    
    it('should parse balances query', () => {
      fetchStatement.fetchType = "balances";
      fetchStatement.balanceType = 'CUMULATIVE'
      expect(Formula.parseFetchStatement(fetchStatement, 'pt_BR').toString()).to.eql('=BKPER_BALANCES_CUMULATIVE("xxx"; 1; "acc: \'some account\'"; TRUE; FALSE; FALSE)');
      fetchStatement.balanceType = 'PERIOD'
      expect(Formula.parseFetchStatement(fetchStatement, 'en_US').toString()).to.eql('=BKPER_BALANCES_PERIOD("xxx", 1, "acc: \'some account\'", TRUE, FALSE, FALSE)');
      fetchStatement.balanceType = 'TOTAL'
      fetchStatement.expanded = 2
      expect(Formula.parseFetchStatement(fetchStatement, 'pt_BR').toString()).to.eql('=BKPER_BALANCES_TOTAL("xxx"; 1; "acc: \'some account\'"; 2; FALSE; FALSE)');
      fetchStatement.balanceType = 'TRIAL'
      expect(Formula.parseFetchStatement(fetchStatement, 'pt_BR').toString()).to.eql('=BKPER_BALANCES_TRIAL("xxx"; 1; "acc: \'some account\'"; 2; FALSE; FALSE)');
    })

  
  });  

  describe('#parseString()', () => {

    it('should parse accounts', () => {
      expect(Formula.parseString('= BKPER_ACCOUNTS("xxx"; 1)', 'pt_BR').toString()).to.eql('=BKPER_ACCOUNTS("xxx"; 1)');
      // Legacy formulas with groups param should still parse (extra param ignored in output)
      expect(Formula.parseString('= BKPER_ACCOUNTS("xxx"; 1; TRUE)', 'pt_BR').toString()).to.eql('=BKPER_ACCOUNTS("xxx"; 1)');
      expect(Formula.parseString('= BKPER_ACCOUNTS("xxx"; 1; TRUE; TRUE)', 'pt_BR').toString()).to.eql('=BKPER_ACCOUNTS("xxx"; 1)');
      // With group filter
      expect(Formula.parseString('= BKPER_ACCOUNTS("xxx"; 1; "Assets")', 'pt_BR').toString()).to.eql('=BKPER_ACCOUNTS("xxx"; 1; "Assets")');
      expect(Formula.parseString('= BKPER_ACCOUNTS("xxx", 1, "My Group")', 'en_US').toString()).to.eql('=BKPER_ACCOUNTS("xxx", 1, "My Group")');
    })

    it('should parse groups', () => {
      expect(Formula.parseString('= BKPER_GROUPS("xxx"; 1)', 'pt_BR').toString()).to.eql('=BKPER_GROUPS("xxx"; 1)');
      // Legacy formulas with properties param should still parse (extra param ignored in output)
      expect(Formula.parseString('= BKPER_GROUPS("xxx"; 1; FALSE)', 'pt_BR').toString()).to.eql('=BKPER_GROUPS("xxx"; 1)');
      expect(Formula.parseString('= BKPER_GROUPS("xxx"; 1; TRUE)', 'pt_BR').toString()).to.eql('=BKPER_GROUPS("xxx"; 1)');
    })

    it('should parse transactions', () => {
      expect(Formula.parseString('= BKPER_TRANSACTIONS("xxx"; 1; "yyy")', 'pt_BR').toString()).to.eql('=BKPER_TRANSACTIONS("xxx"; 1; "yyy")');
      // Legacy formulas with properties/ids params should still parse (extra params ignored in output)
      expect(Formula.parseString('= BKPER_TRANSACTIONS("xxx"; 1; "yyy"; TRUE; FALSE)', 'pt_BR').toString()).to.eql('=BKPER_TRANSACTIONS("xxx"; 1; "yyy")');
    })

    it('should replace query double quotes', () => {
      expect(Formula.parseString('=BKPER_TRANSACTIONS("xxx"; 1; "acc: \'some account\'"; TRUE; true)', 'en_US').toString()).to.eql('=BKPER_TRANSACTIONS("xxx", 1, "acc: \'some account\'")');
    })
    
    it('should parse balances query', () => {
      expect(Formula.parseString('=BKPER_BALANCES_CUMULATIVE("xxx", 1, "acc: \'some account\'"; FALSE; TRUE; TRUE) ', 'en_US').toString()).to.eql('=BKPER_BALANCES_CUMULATIVE("xxx", 1, "acc: \'some account\'", FALSE, TRUE, TRUE)');
      expect(Formula.parseString(' =BKPER_BALANCES_PERIOD("xxx"; 1; "acc: \'some account\'"; false; false; false)', 'pt_BR').toString()).to.eql('=BKPER_BALANCES_PERIOD("xxx"; 1; "acc: \'some account\'"; FALSE; FALSE; FALSE)');
      expect(Formula.parseString('=  BKPER_BALANCES_TOTAL("xxx"; 1; "acc: \'some account\'"; 3, FALSE, TRUE)', 'pt_BR').toString()).to.eql('=BKPER_BALANCES_TOTAL("xxx"; 1; "acc: \'some account\'"; 3; FALSE; TRUE)');
      expect(Formula.parseString('=  BKPER_BALANCES_TRIAL("xxx"; 1; "acc: \'some account\'"; true, FALSE, TRUE)', 'pt_BR').toString()).to.eql('=BKPER_BALANCES_TRIAL("xxx"; 1; "acc: \'some account\'"; TRUE; FALSE; TRUE)');
    })

    it('should preserve references', () => {
      expect(Formula.parseString('= BKPER_TRANSACTIONS(H1; 1; H3)', 'pt_BR').toString()).to.eql('=BKPER_TRANSACTIONS(H1; 1; H3)');
      // Legacy formulas with properties/ids params should still parse (extra params ignored in output)
      expect(Formula.parseString('= BKPER_TRANSACTIONS(H1; 1; H3; G3; FALSE)', 'pt_BR').toString()).to.eql('=BKPER_TRANSACTIONS(H1; 1; H3)');
    })

    it('should not parse comma inside quotes', () => {
      expect(Formula.parseString('=BKPER_TRANSACTIONS(H1; 1; "account: \'Account, bla\'")', 'pt_BR').toString()).to.eql('=BKPER_TRANSACTIONS(H1; 1; "account: \'Account, bla\'")');
      expect(Formula.parseString(' =BKPER_BALANCES_PERIOD("xxx"; 1; "acc: \'some, account\'"; false; false; false)', 'pt_BR').toString()).to.eql('=BKPER_BALANCES_PERIOD("xxx"; 1; "acc: \'some, account\'"; FALSE; FALSE; FALSE)');
    })

    it('should preserve inner formulas', () => {
      expect(Formula.parseString('=BKPER_BALANCES_PERIOD(\'Configuração\'!$C$5, 21, "group:\'Receita Provedores Regionais\' after:"&TEXT(\'Configuração\'!$C$6, "mm/yyyy")&" before:"&TEXT(\'Configuração\'!$C$7, "mm/yyyy"), FALSE, TRUE, TRUE)', 'en_US')
      .toString()).to.eql('=BKPER_BALANCES_PERIOD(\'Configuração\'!$C$5, 21, "group:\'Receita Provedores Regionais\' after:"&TEXT(\'Configuração\'!$C$6, "mm/yyyy")&" before:"&TEXT(\'Configuração\'!$C$7, "mm/yyyy"), FALSE, TRUE, TRUE)');
      
      expect(Formula.parseString('=BKPER_BALANCES_TOTAL("xxx", 10, "account:\'"& B9 &"\' on:31/12/2021", FALSE, FALSE, TRUE)', 'en_US').toString()).to.eql('=BKPER_BALANCES_TOTAL("xxx", 10, "account:\'"& B9 &"\' on:31/12/2021", FALSE, FALSE, TRUE)');
    })
  
  });  
});



