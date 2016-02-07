set ansi_nulls on
go
set quoted_identifier on
go
/**
 * Создние карточек для активных сотрудников на указанный год, если они отсутствуют
 *
 * @created 02.02.2016 by SMGladkovskiy@gmail.com
 */
create procedure [dbo].[user_rp_create_cards_by_year] @period INT

as -- обьявляем курсор
  declare personIdCursor cursor
    --- sql запрос на получение карточек за период, формирующий набор данных для курсора
  for
    -- получаем идентификаторы активных сотрудников, у которых нет карточек в указанный период
    select person.id as personId
    from [dbo].[user_rp_persons] as person
      full join [dbo].[user_rp_ach_cards] as card on person.id = card.person_id and card.period = @period
    where person.out_date = ' ' and card.id is null;

  -- открываем курсор
  open personIdCursor
  -- курсор создан, обьявляем переменные и обходим набор строк в цикле
  declare @counter INT
  declare @personId INT
  declare @minPersonId INT
  set @counter = 0
  -- выборка первой  строки
  fetch next from personIdCursor
  into @personId
  -- цикл с логикой и выборкой всех последующих строк после первой
  while @@FETCH_STATUS = 0
    begin
      --- логика внутри цикла
      set @counter = @counter + 1

      select @minPersonId = MIN(ref_id)
        from [dbo].[user_rp_persons_transferred_ids]
      where person_id = @personId;

      if(@minPersonId IS NULL)
        set @minPersonId = @personId;

      insert into [dbo].[user_rp_ach_cards] (person_id, period) values ( @minPersonId, @period );
      -- выборка следующей строки
      fetch next from personIdCursor
      into @personId
      -- завершение логики внутри цикла
    end
  select @counter as final_count
  -- закрываем курсор
  close personIdCursor
  deallocate personIdCursor