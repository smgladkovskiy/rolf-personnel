set ansi_nulls on
go
set quoted_identifier on
go

/**
 * ���������� ����������� ���������� �� ��������� ��������� ����������� �� ��������� ������
 *
 * @created 29.01.2016 by SMGladkovskiy@gmail.com
 */
create procedure [dbo].[user_rp_update_cards_competences] @period INT

as -- ��������� ������
  declare cardCursor cursor
    --- sql ������ �� ��������� �������� �� ������, ����������� ����� ������ ��� �������
  for
    select id
    from [dbo].[user_rp_ach_cards]
    where period = @period;
  -- ��������� ������
  open cardCursor
  -- ������ ������, ��������� ���������� � ������� ����� ����� � �����
  declare @counter INT
  declare @cardId INT
  set @counter = 0
  -- ������� ������  ������
  fetch next from cardCursor
  into @cardId
  -- ���� � ������� � �������� ���� ����������� ����� ����� ������
  while @@FETCH_STATUS = 0
    begin
      --- ������ ������ �����
      set @counter = @counter + 1
      exec [dbo].[user_proc_rp_ach_insert_cards_competences] @cardId

      -- ������� ��������� ������
      fetch next from cardCursor
      into @cardId
      -- ���������� ������ ������ �����
    end
  select @counter as final_count
  -- ��������� ������
  close cardCursor
  deallocate cardCursor