set ansi_nulls on
go
set quoted_identifier on
go
/**
 * ������� �������� ��� �������� ����������� �� ��������� ���, ���� ��� �����������
 *
 * @created 02.02.2016 by SMGladkovskiy@gmail.com
 */
create procedure [dbo].[user_rp_create_cards_by_year] @period INT

as -- ��������� ������
  declare personIdCursor cursor
    --- sql ������ �� ��������� �������� �� ������, ����������� ����� ������ ��� �������
  for
    -- �������� �������������� �������� �����������, � ������� ��� �������� � ��������� ������
    select person.id as personId
    from [dbo].[user_rp_persons] as person
      full join [dbo].[user_rp_ach_cards] as card on person.id = card.person_id and card.period = @period
    where person.out_date = ' ' and card.id is null;

  -- ��������� ������
  open personIdCursor
  -- ������ ������, ��������� ���������� � ������� ����� ����� � �����
  declare @counter INT
  declare @personId INT
  declare @minPersonId INT
  set @counter = 0
  -- ������� ������  ������
  fetch next from personIdCursor
  into @personId
  -- ���� � ������� � �������� ���� ����������� ����� ����� ������
  while @@FETCH_STATUS = 0
    begin
      --- ������ ������ �����
      set @counter = @counter + 1

      select @minPersonId = MIN(ref_id)
        from [dbo].[user_rp_persons_transferred_ids]
      where person_id = @personId;

      if(@minPersonId IS NULL)
        set @minPersonId = @personId;

      insert into [dbo].[user_rp_ach_cards] (person_id, period) values ( @minPersonId, @period );
      -- ������� ��������� ������
      fetch next from personIdCursor
      into @personId
      -- ���������� ������ ������ �����
    end
  select @counter as final_count
  -- ��������� ������
  close personIdCursor
  deallocate personIdCursor