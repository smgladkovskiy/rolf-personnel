set ansi_nulls on
go
set quoted_identifier on
go
/**
 * Обновление компетенций сотрудника
 *
 * @updated 27.11.2013 by SMGladkovskiy@rolf.ru
 * @updated 24.01.2016 by SMGladkovskiy@gmail.com
 */
alter procedure [dbo].[user_proc_rp_ach_insert_cards_competences] @card_id INT

as

declare @Actual_competences TABLE(id INT, competence_id INT)
declare @card_competences TABLE(card_id INT, competence_id INT)
declare @newPersonId INT
declare @personId INT
declare @cardPeriod INT
declare @subordinates INT

-- проверка на наличие переходов на новую должность.
-- так как берётся person_id из карточки, то это самый первый person_id в системе.
-- необходимо искать актуальный и по нему смотреть компетенции
-- Обозначаем период
select
    @newPersonId = MAX (I.ref_id),
    @cardPeriod = MAX (Ca.period)
from
  user_rp_persons_integrated_sap I, user_rp_ach_cards Ca
where
  Ca.id = @card_id
  and I.person_id = Ca.person_id
group by I.person_id;

if (@cardPeriod is null)
  begin
    select @cardPeriod = Ca.period
    from
      user_rp_ach_cards Ca
    where
      Ca.id = @card_id;
  end

-- Получаем person_id для выяснения наличия подчинённых
select @personId = Ca.person_id
from
  user_rp_ach_cards Ca
where
  Ca.id = @card_id;

-- фиксируем наличие подчинённых
select @subordinates = case when P.pid is null
  then 0
                       else 1 end
from user_rp_tree_posts P, user_rp_tree_posts_employees_PM PE
where (PE.person_id = @personId) and (P.pid = PE.post_id)
if @cardPeriod < 2013
  begin
    -- вставка доп. компетенций - за 2006-й год их не было
    insert into @Actual_competences (id, competence_id)
      select distinct
        Ca.id,
        competence_id
      from
        user_rp_employees_attribs A, user_rp_ach_cards Ca, user_rp_ach_groups_employees G
        inner join user_rp_ach_groups_employees_competences GP on G.group_id = GP.group_id
        inner join user_rp_ach_competences C on GP.competence_id = C.id
      where
        Ca.id = @card_id
        and period <> 2006
        and A.person_id = case when isnull (@newPersonId, 0) = 0
          then Ca.person_id
                          else @newPersonId end
        and (A.grade between grade_min and grade_max or (grade_min is null and grade_max is null))
        and (A.business_unit_id = G.business_unit_id or G.business_unit_id is null)
        and (A.job_family_id = G.job_family_id or G.job_family_id is null)
        --and (A.appointment_id=G.appointment_id or G.appointment_id is null)
        --and G.disabled=0
        and C.additional = 1

    -- вставка основных компетенций
    insert into @Actual_competences (id, competence_id)
      select distinct
        Ca.id,
        competence_id
      from
        user_rp_employees_attribs A, user_rp_ach_cards Ca, user_rp_ach_groups_employees G
        inner join user_rp_ach_groups_employees_competences GP on G.group_id = GP.group_id
        inner join user_rp_ach_competences C on GP.competence_id = C.id
      where
        Ca.id = @card_id
        and A.person_id = case when isnull (@newPersonId, 0) = 0
          then Ca.person_id
                          else @newPersonId end
        and (A.grade between grade_min and grade_max or (grade_min is null and grade_max is null))
        and (A.business_unit_id = G.business_unit_id or G.business_unit_id is null)
        and (A.job_family_id = G.job_family_id or G.job_family_id is null)
        --and (A.appointment_id=G.appointment_id or G.appointment_id is null)
        --and G.disabled=0
        and (C.additional = 0 and G.type = A.type)
  end
else if @cardPeriod between 2013 and 2015
  begin
    -- вставка основных компетенций
    --    insert into @Actual_competences (id,competence_id)
    --    EXEC user_get_cards_competences @personId, @cardPeriod

    -- Получаем список компетенций по person_id  и period
    insert into @card_competences (card_id, competence_id)
      select distinct
        C.id  as card_id,
        CO.id as competence_id
      from user_rp_employees_attribs A, user_rp_ach_cards C, user_rp_ach_competences CO

      where C.id = @card_id
            and A.person_id = C.person_id
            and (A.grade between CO.grade_from and CO.grade_to)
            and CO.has_subordinates = 0
    if @subordinates = 1
      begin
        insert into @card_competences (card_id, competence_id)
          select distinct
            C.id  as card_id,
            CO.id as competence_id
          from user_rp_employees_attribs A, user_rp_ach_cards C, user_rp_ach_competences CO

          where C.id = @card_id
                and A.person_id = C.person_id
                and (A.grade between CO.grade_from and CO.grade_to)
                and CO.has_subordinates = 1
      end
    insert into @Actual_competences (id, competence_id)
      select
        card_id,
        competence_id
      from
        (
          select *
          from @card_competences) card_competences
  end;
else if @cardPeriod >= 2016
  begin
    insert into @Actual_competences (id, competence_id)
    exec user_get_cards_competences @personId, @cardPeriod
  end

-- вставить недостающие компетенции
insert into user_rp_ach_cards_competences (card_id, competence_id)
  select Actual_competences.*
  from
    (
      select *
      from @Actual_competences
      where id = @card_id) Actual_competences
    full join
    (
      select *
      from user_rp_ach_cards_competences
      where card_id = @card_id and competence_id is not null) Current_competences
      on Actual_competences.id = Current_competences.card_id
         and Actual_competences.competence_id = Current_competences.competence_id
  where Current_competences.competence_id is null

-- пометить как архивные, компетенции которых нет в актуальных
update user_rp_ach_cards_competences
set disabled = 1
where
  card_id = @card_id
  and competence_id in
      (
        select Current_competences.competence_id
        from (
               select *
               from @Actual_competences
               where id = @card_id) Actual_competences
          full join
          (
            select *
            from user_rp_ach_cards_competences
            where card_id = @card_id and competence_id is not null) Current_competences
            on Actual_competences.id = Current_competences.card_id
               and Actual_competences.competence_id = Current_competences.competence_id
        where Actual_competences.competence_id is null)