set ansi_nulls on
go
set quoted_identifier on
go
/**
 * Получение компетенций сотрдника
 *
 * @updated 27.11.2013 by SMGladkovskiy@rolf.ru
 * @updated 29.01.2016 by SMGladkovskiy@gmail.com
 */
alter procedure [dbo].[user_get_cards_competences] @personId INT, @period INT as

declare @card_competences TABLE(card_id INT, competence_id INT)
declare @card_id INT
declare @subordinates INT
declare @newPersonId INT

-- Если период действия карточки меньше 2013г, старый алгоритм с компетенциями
if @period < 2013
  begin
    -- получаем идентификатор текущей карточки сотрудника
    select @card_id = id
    from user_rp_ach_cards
    where ( person_id = @personId ) and ( period = @period )

    -- Получаем список основных компетенций по person_id  и period
    select distinct
      user_rp_ach_cards.id as card_id
      , G.group_id
      , competence_id
      , C.additional
    from user_rp_employees_attribs A, user_rp_ach_cards, user_rp_ach_groups_employees G
      inner join user_rp_ach_groups_employees_competences GP on G.group_id = GP.group_id
      inner join user_rp_ach_competences C on GP.competence_id = C.id

    where user_rp_ach_cards.id = @card_id
          and A.person_id = user_rp_ach_cards.person_id
          and ( A.grade between grade_min and grade_max or ( grade_min is null and grade_max is null ) )
          and ( A.business_unit_id = G.business_unit_id or G.business_unit_id is null )
          and ( A.job_family_id = G.job_family_id or G.job_family_id is null )
          --and (A.appointment_id=G.appointment_id or G.appointment_id is null)
          --and G.disabled=0
          -- связь по типу персонала - только для корпоратвных компетенций
          and ( C.additional = 0 and G.type = A.type )

    -- Получаем список дополнительных компетенций по person_id  и period
    select distinct
      user_rp_ach_cards.id as card_id
      , G.group_id
      , competence_id
      , C.additional
    from user_rp_employees_attribs A, user_rp_ach_cards, user_rp_ach_groups_employees G
      inner join user_rp_ach_groups_employees_competences GP on G.group_id = GP.group_id

      inner join user_rp_ach_competences C on GP.competence_id = C.id

    where user_rp_ach_cards.id = @card_id and period <> 2006
          and A.person_id = user_rp_ach_cards.person_id
          and ( A.grade between grade_min and grade_max or ( grade_min is null and grade_max is null ) )
          and ( A.business_unit_id = G.business_unit_id or G.business_unit_id is null )
          and ( A.job_family_id = G.job_family_id or G.job_family_id is null )
          --and (A.appointment_id=G.appointment_id or G.appointment_id is null)
          --and G.disabled=0
          -- связь по типу персонала - только для дополнительных компетенций
          and C.additional = 1
  end
-- Если период действия карточки меньше c 2013 по 2015 года включительно, то используем алгоритм
-- без доп компетенций и с учётом подчинённых
else if @period < 2016
  begin
    -- получаем идентификатор текущей карточки сотрудника
    select @card_id = id
    from user_rp_ach_cards
    where ( person_id = @personId ) and ( period = @period )

    -- фиксируем наличие подчинённых
    select @subordinates = case when P.pid is null
      then 0
                           else 1 end
    from user_rp_tree_posts P, user_rp_tree_posts_employees_PM PE
    where ( PE.person_id = @personId ) and ( P.pid = PE.post_id )

    -- Получаем список компетенций по person_id и period при отсутствии подчинённых
    insert into @card_competences (card_id, competence_id)
      select distinct
          C.id  as card_id
        , CO.id as competence_id
      from user_rp_employees_attribs A, user_rp_ach_cards C, user_rp_ach_competences CO

      where C.id = @card_id
            and A.person_id = C.person_id
            and ( A.grade between CO.grade_from and CO.grade_to )
            and CO.has_subordinates = 0

    -- Получаем список компетенций по person_id и period при наличии подчинённых
    if @subordinates = 1
      begin
        insert into @card_competences (card_id, competence_id)
          select distinct
              C.id  as card_id
            , CO.id as competence_id
          from user_rp_employees_attribs A, user_rp_ach_cards C, user_rp_ach_competences CO

          where C.id = @card_id
                and A.person_id = C.person_id
                and ( A.grade between CO.grade_from and CO.grade_to )
                and CO.has_subordinates = 1
      end
    -- отдаём список компетенций
    select card_competences.*
    from (
           select *
           from @card_competences ) card_competences
  end
-- Если период действия карточки c 2016 года, то используем алгоритм, основанный на грейде и job family
else if @period >= 2016
  begin
    -- проверка на наличие переходов на новую должность.
    -- так как берётся person_id из карточки, то это самый первый person_id в системе.
    -- необходимо искать актуальный и по нему смотреть компетенции
    -- Обозначаем период
    select @newPersonId = MAX ( ref_id )
    from
      user_rp_persons_transferred_ids
    where
      person_id = @personId;

    if ( @newPersonId is null )
      begin
        set @newPersonId = @personId;
      end

    -- отдаём список компетенций по person_id, period, grade и job_family_id
    select distinct
        cards.id             as card_id
      , matrix.competence_id as competence_id
    from user_rp_employees_attribs empAttr, user_rp_ach_cards cards, user_rp_ach_competences_matrix matrix

    where cards.person_id = @personId
          and cards.period = @period
          and empAttr.person_id = @newPersonId
          and empAttr.grade = matrix.grade
          and empAttr.job_family_id = matrix.job_family_id
  end
go