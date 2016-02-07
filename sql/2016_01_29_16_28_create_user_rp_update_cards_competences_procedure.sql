set ansi_nulls on
go
set quoted_identifier on
go

/**
 * Обновление компетенций сотрудника по имеющимся карточкам сотрудников за указанный период
 *
 * @created 29.01.2016 by SMGladkovskiy@gmail.com
 */
create procedure [dbo].[user_rp_update_cards_competences] @period INT

as -- обьявляем курсор
  declare cardCursor cursor
    --- sql запрос на получение карточек за период, формирующий набор данных для курсора
  for
    select id
    from [dbo].[user_rp_ach_cards]
    where period = @period;
  -- открываем курсор
  open cardCursor
  -- курсор создан, обьявляем переменные и обходим набор строк в цикле
  declare @counter INT
  declare @cardId INT
  set @counter = 0
  -- выборка первой  строки
  fetch next from cardCursor
  into @cardId
  -- цикл с логикой и выборкой всех последующих строк после первой
  while @@FETCH_STATUS = 0
    begin
      --- логика внутри цикла
      set @counter = @counter + 1
      exec [dbo].[user_proc_rp_ach_insert_cards_competences] @cardId

      -- выборка следующей строки
      fetch next from cardCursor
      into @cardId
      -- завершение логики внутри цикла
    end
  select @counter as final_count
  -- закрываем курсор
  close cardCursor
  deallocate cardCursor