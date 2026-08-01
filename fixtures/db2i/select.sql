select coalesce(cusbal, 0), current timestamp
  into :custRow.balance, :nullInd
  from mylib/custmast
 where cusnbr = ? and status <> 'X';
