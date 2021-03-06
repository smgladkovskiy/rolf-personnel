
var Card = new function()
{
	var _tasks         = null;			// ������� ������-�����
	var _func_tasks    = null;			// ������� �������������� ������ �����
	var _standsCompets = null;
	var _additsCompets = null;
	var _trains        = null;
	var _ratings       = null;
	var _comments      = null;
	var _func_comment  = null;
	var _func_div	   = null;

	var _fieldRatingTasks   = null;
	var _fieldRatingFunc    = null;
	var _fieldRatingCompets = null;
	var _fieldRatingTotal   = null;

	var _buttonAddTask = null;
	var _buttonAddTraining = null;

	var ratio_mng = null;
	var ratio_fnc = null;
	var lbl_mng = null;
	var lbl_fnc = null;

	var _period = null;

	this.init = function(period)
	{
		_tasks                 = document.getElementById('tasks');
		_personaltasks         = document.getElementById('personaltasks');
		_managertasks          = document.getElementById('managertasks');
		_personalCompetence    = document.getElementById('personalCompetence');
		_personalTraining      = document.getElementById('personalTraining');
		_func_tasks            = document.getElementById('functasks');
		_standsCompets         = document.getElementById('standsCompets');
		_personalStandsCompets = document.getElementById('personalStandsCompets');
		_additsCompets         = document.getElementById('additsCompets');
		_personalAdditsCompets = document.getElementById('personalAdditsCompets');
		_trains                = document.getElementById('trains');
		_ratings               = document.getElementById('ratings');
		_comments              = document.getElementById('comments');
		_emp_comment           = document.getElementById('comment_employee');
		_sum_rtg_tasks         = document.getElementById('sum_tasks');
		_rtg_tasks             = document.getElementById('ratings[rtg_tasks_id]');
		_rtg_competens         = document.getElementById('ratings[rtg_competens_id]');
		_func_comment          = document.getElementById('comments[fnc_comment]');
		_func_div              = document.getElementById('func_div');

		ratio_mng = document.getElementById('ratio[ratio_mng]');
		ratio_fnc = document.getElementById('ratio[ratio_fnc]');
		if (ratio_mng && ratio_fnc)
			if ((!ratio_mng.value) && (!ratio_fnc.value)){
				ratio_mng.value = 50;
				ratio_fnc.value = 50;
			}

		lbl_mng = document.getElementById('ratio_mng');
		lbl_fnc = document.getElementById('ratio_fnc');

		_fieldRatingTasks   = document.getElementById('fieldRatingTasks');
		_fieldRatingFunc    = document.getElementById('fieldRatingFunc');
		_fieldRatingCompets = document.getElementById('fieldRatingCompets');
		_fieldRatingTotal   = document.getElementById('fieldRatingTotal');

		_getControl(_fieldRatingTasks).onchange   = _ratingTasksOnchange;
		_getControl(_fieldRatingCompets).onchange = _ratingCompetsOnchange;

		_buttonAddTask         = document.getElementById('buttonAddTask');
		_buttonAddPersonalTask = document.getElementById('buttonAddPersonalTask');
		_buttonAddTraining     = document.getElementById('buttonAddTraining');

		_period = period;
	}


	this.displayRatio = function()
	{
		ratio_mng.style.display = 'none';
		ratio_fnc.style.display = 'none';

		if (ratio_mng.value) lbl_mng.innerHTML = ratio_mng.value; else lbl_mng.innerHTML = '50';
		if (ratio_fnc.value) lbl_fnc.innerHTML = ratio_fnc.value; else lbl_fnc.innerHTML = '50';
	}

	this.CalculateRating = function()
	{
		var rows  = _tasks.rows;
		var len   = _tasks.rows.length-1;
		var i, cells, index, weight, rate, status;
		var sum = 0;
		var fsum = 0;
		for(i=0; i<len; i++)
		{
			cells = rows[i].cells;
			index = _getControl(cells[6]).selectedIndex;
			rate = this.returnWeight(_getControl(cells[6]).options[index].text);
			weight = _getControl(cells[3]).value;
			status = _getControl(cells[0]).value;
			if ((!rate) || (!weight) || (rate == 0) || (status == 0)) continue;
			sum += weight * rate;
		}
		if (count_func > 0)
		{
			var func_rows = _func_tasks.rows;
			var flen = _func_tasks.rows.length - 1;
			for(i=0; i<flen; i++)
			{
				cells = func_rows[i].cells;
				index = _getControl(cells[6]).selectedIndex;
				rate = this.returnWeight(_getControl(cells[6]).options[index].text);
				weight = _getControl(cells[3]).value;
				status = _getControl(cells[0]).value;
				if ((!rate) || (!weight) || (rate == 0) || (status == 0)) continue;
				fsum += weight * rate;
			}
		}
		var ret = 0;
		sum /= 100;
		fsum /= 100;
		if ((count_func > 0) && (fsum != 0))
		{
			var rate_sum = Math.round(sum);
			var rate_fsum = Math.round(fsum);
			var mng = parseInt(ratio_mng.value, 10);
			var fnc = parseInt(ratio_fnc.value, 10);
			var total = (rate_sum * mng + rate_fsum * fnc)/100;
			ret = Math.round(total);
		}
		else ret = Math.round(sum);

		return this.returnName(ret);
	}

	this.CalculateCompetences = function()
	{
		var srows = _standsCompets.rows;

		if(_additsCompets)
		{
			var arows = _additsCompets.rows;
		}
		else
		{
			var arows = {};
		}

		var slen  = _standsCompets.rows.length;

		if(_additsCompets)
		{
			var alen  = _additsCompets.rows.length;
		}
		else
		{
			var alen  = {};
		}

		var i, cells, index, rate;
		var sum = 0;
		var count = 0;
		for(i=0; i<slen ;i++)
		{
			cells = srows[i].cells;
			index = _getControl(cells[5]).selectedIndex;
			rate = parseInt(this.returnWeight(_getControl(cells[5]).options[index].text), 10);
			sum += rate;
			count++;
		}
		for(i=0; i<alen ;i++)
		{
			cells = arows[i].cells;
			index = _getControl(cells[5]).selectedIndex;
			rate = parseInt(this.returnWeight(_getControl(cells[5]).options[index].text), 10);
			sum += rate;
			count++;
		}
		var ret = 0;
		if (count) ret = Math.round(sum / count);
		return this.returnName(ret);

	}

	this.returnWeight = function(name)
	{
		var i;
		var len = Rate_Names.length;
		for(i=0; i<len; i++)
			if (Rate_Names[i] == name) break;
		return Rate_Weights[i];
	}

	this.returnName = function(weight)
	{
		var i;
		var len = Rate_Weights.length;
		for(i=0; i<len; i++)
			if (Rate_Weights[i] == weight) break;
		return Rate_Names[i];
	}

	this.toggleCancel = function(node, tableID)
	{
		var row = node.parentNode.parentNode;
		var toggle = _getControl(node.parentNode);

		//alert(toggle.value)
		if (toggle.value == '0') {

			var table = document.getElementById(tableID);

			var count = Card.countActiveObjectivesByStatus(table);

			if (count > 6)
			{
				alert("��������! ����������� �� ���������� ����� �� ����� 6 �����! ��� ����� ������� ��� �������� ������ ����!");
				return;
			}

			toggle.value = 1;
			row.className = row.className.replace(/\s*\brow-canceled\b/ig, '');
		} else {
			toggle.value = 0;
			row.className += ' row-canceled';
		}
	}

	this.removeRow = function(node)
	{
		var row = node.parentNode.parentNode;

		row.parentNode.removeChild(row);
	}

	this.addTask = function()
	{
		var row   = _cloneLastRow(_tasks);
		var name  = 'newTasks[' + row.rowIndex + ']';
		var cells = row.cells;

		_getControl(cells[0]).name = name + '[status]';
		_getControl(cells[1]).name = name + '[description]';
		_getControl(cells[3]).name = name + '[weight]';
		_getControl(cells[4]).name = name + '[is_functional]';
		_getControl(cells[5]).name = name + '[result]';
		_getControl(cells[6]).name = name + '[rating_id]';

		var input = _getControl(cells[2]).nextSibling;
		if (!input.name) {
			input = input.nextSibling;
		}
		input.name = name + '[date_term]';

		_getControl(cells[2]).onclick = Card.calendar;

		_getControl(cells[6]).parentNode.className = _getControl(cells[6]).parentNode.className.replace(/\s*\bfield-activated\b/ig, '');
		row.className = row.className.replace(/\s*\brow-pattern\b/ig, '');
	}

	this.addPersonalTask = function()
	{

		var row   = _cloneLastRow(_personaltasks);
		var name  = 'newTasks[' + row.rowIndex + ']';
		var cells = row.cells;

		_getControl(cells[0]).name = name + '[status]';
		_getControl(cells[1]).name = name + '[description]';
		_getControl(cells[3]).name = name + '[weight]';
		_getControl(cells[4]).name = name + '[is_personal]';
		_getControl(cells[5]).name = name + '[result]';
		_getControl(cells[6]).name = name + '[rating_id]';

		var input = _getControl(cells[2]).nextSibling;
		if (!input.name) {
			input = input.nextSibling;
		}
		input.name = name + '[date_term]';

		_getControl(cells[2]).onclick = Card.calendar;

		_getControl(cells[6]).parentNode.className = _getControl(cells[6]).parentNode.className.replace(/\s*\bfield-activated\b/ig, '');
		row.className = row.className.replace(/\s*\brow-pattern\b/ig, '');
	}

	this.addFuncTask = function()
	{
		var row   = _cloneLastRow(_func_tasks);
		var name  = 'newTasks[' + row.rowIndex + ']';
		var cells = row.cells;

		_getControl(cells[0]).name = name + '[status]';
		_getControl(cells[1]).name = name + '[description]';
		_getControl(cells[3]).name = name + '[weight]';
		_getControl(cells[4]).name = name + '[is_functional]';
		_getControl(cells[5]).name = name + '[result]';
		_getControl(cells[6]).name = name + '[rating_id]';

		var input = _getControl(cells[2]).nextSibling;
		if (!input.name) {
			input = input.nextSibling;
		}
		input.name = name + '[date_term]';

		_getControl(cells[2]).onclick = Card.calendar;

		_getControl(cells[6]).parentNode.className = _getControl(cells[6]).parentNode.className.replace(/\s*\bfield-activated\b/ig, '');
		row.className = row.className.replace(/\s*\brow-pattern\b/ig, '');
	}

	this.addTrain = function()
	{
		var row   = _cloneLastRow(_trains);
		var name  = 'newTrainings[' + row.rowIndex + ']';
		var cells = row.cells;

		_getControl(cells[1]).name = name + '[situation]';
		_getControl(cells[2]).name = name + '[objective]';
		_getControl(cells[3]).name = name + '[method_id]';
		_getControl(cells[4]).name = name + '[responsible_id]';
		_getControl(cells[5]).name = name + '[month_term_id]';
		_getControl(cells[6]).name = name + '[result]';

		cells[3].getElementsByTagName('textarea')[0].name = name + '[method_comment]';
		cells[4].getElementsByTagName('textarea')[0].name = name + '[responsible_comment]';

		row.className = row.className.replace(/\s*\brow-pattern\b/ig, '');
	}

	this.setPlanTask = function(row)
	{
		var cells = row.cells;
		var status = _getControl(cells[0]).value;

		row.className += ' row-planning';

		switch (status) {
			case '':
				//cells[0].className += ' field-activated';
				cells[1].className += ' field-activated';
				cells[2].className += ' field-activated';
				cells[3].className += ' field-activated';
				cells[5].className += ' field-activated';
				//cells[6].className += ' field-activated';
				_getControl(cells[1]).readOnly = false;
				_getControl(cells[2]).onclick  = this.calendar;
				_getControl(cells[3]).readOnly = false;
				_getControl(cells[5]).readOnly = false;
				break;
			case '1':
				cells[1].className += ' field-activated';
				cells[2].className += ' field-activated';
				cells[3].className += ' field-activated';
				_getControl(cells[3]).readOnly = false;
				cells[5].className += ' field-activated';
				_getControl(cells[5]).readOnly = false;
				break;
			case '2':
				cells[3].className += ' field-activated';
				cells[5].className += ' field-activated';
				_getControl(cells[3]).readOnly = false;
				_getControl(cells[5]).readOnly = false;
				break;
			default:
				return;
		}
		/*if (status != '0')
		{
			cells[1].className += ' field-activated';
			cells[2].className += ' field-activated';
			cells[3].className += ' field-activated';
			_getControl(cells[1]).readOnly = false;
			_getControl(cells[2]).onclick  = this.calendar;
			_getControl(cells[3]).readOnly = false;
			cells[5].className += ' field-activated';
			_getControl(cells[5]).readOnly = false;
		}*/
		return;

	}

	this.setPlanTaskPersonal = function(row)
	{
		var cells = row.cells;
		var status = _getControl(cells[0]).value;

		row.className += ' row-planning';

		switch (status) {
			case '':
				//cells[0].className += ' field-activated';
				cells[1].className += ' field-activated';
				cells[2].className += ' field-activated';
				cells[3].className += ' field-activated';
				//cells[5].className += ' field-activated';
				//cells[6].className += ' field-activated';
				_getControl(cells[1]).readOnly = false;
				_getControl(cells[2]).onclick  = this.calendar;
				_getControl(cells[3]).readOnly = false;
				//_getControl(cells[5]).readOnly = false;
				break;
			case '1':
				cells[1].className += ' field-activated';
				cells[2].className += ' field-activated';
				cells[3].className += ' field-activated';
				_getControl(cells[3]).readOnly = false;
				cells[5].className += ' field-activated';
				_getControl(cells[5]).readOnly = false;
				break;
			case '2':
				cells[3].className += ' field-activated';
				cells[5].className += ' field-activated';
				_getControl(cells[3]).readOnly = false;
				_getControl(cells[5]).readOnly = false;
				break;
			default:
				return;
		}
		/*if (status != '0')
		{
			cells[1].className += ' field-activated';
			cells[2].className += ' field-activated';
			cells[3].className += ' field-activated';
			_getControl(cells[1]).readOnly = false;
			_getControl(cells[2]).onclick  = this.calendar;
			_getControl(cells[3]).readOnly = false;
			cells[5].className += ' field-activated';
			_getControl(cells[5]).readOnly = false;
		}*/
		return;

	}

	this.setRateTask = function(row)
	{
		var cells = row.cells;
		var status = _getControl(cells[0]).value;

		switch (status) {
			case '1':
				cells[5].className += ' field-activated';
				cells[6].className += ' field-activated';
				_getControl(cells[5]).readOnly = false;
				_getControl(cells[6]).readOnly = false;
				break;
			case '2':
				cells[5].className += ' field-activated';
				cells[6].className += ' field-activated';
				_getControl(cells[5]).readOnly = false;
				_getControl(cells[6]).readOnly = false;
				break;
			default:
				return;
		}


	}

	this.setRateTask2 = function(row)
	{
		var cells = row.cells;
//		var status = _getControl(cells[0]).value;
//
//		if (status != '0')
//		{
			cells[3].className += ' field-activated';
			cells[4].className += ' field-activated';
			_getControl(cells[3]).readOnly = false;
			_getControl(cells[4]).readOnly = false;
//		}

//		switch (status) {
//			case '1':
//				cells[5].className += ' field-activated';
//				cells[6].className += ' field-activated';
//				_getControl(cells[5]).readOnly = false;
//				_getControl(cells[6]).readOnly = false;
//				break;
//			case '2':
//				cells[5].className += ' field-activated';
//				cells[6].className += ' field-activated';
//				_getControl(cells[5]).readOnly = false;
//				_getControl(cells[6]).readOnly = false;
//				break;
//			default:
//				return;
//		}


	}
	this.setPlanTask2 = function(row)
	{
		var cells = row.cells;
		cells[5].className += ' field-activated';
		_getControl(cells[5]).readOnly = false;
	}

	this.setPlanTask3 = function(row)
	{
		var cells = row.cells;
		cells[3].className += ' field-activated';
		_getControl(cells[3]).readOnly = false;
	}

	// ����������� ������ cells �� 1 (=4), ��� ��� ����������� ������� ������� � ������������
	this.setPlanCompet = function(row)
	{
		var cells = row.cells;

		cells[4].className += ' field-activated';
		_getControl(cells[4]).readOnly = false;
	}

	// ����������� ������ cells �� 1 (=4), ��� ��� ����������� ������� ������� � ������������
	this.setRateCompet = function(row)
	{
		var cells = row.cells;

		cells[4].className += ' field-activated';
		cells[5].className += ' field-activated';
		_getControl(cells[4]).readOnly = false;
	}

	this.setPlanTrain = function(row)
	{
		var cells = row.cells;

		cells[1].className += ' field-activated';
		cells[2].className += ' field-activated';
		cells[3].className += ' field-activated';
		cells[4].className += ' field-activated';
		cells[5].className += ' field-activated';
		cells[6].className += ' field-activated';

		_getControl(cells[1]).readOnly = false;
		_getControl(cells[2]).readOnly = false;
		_getControl(cells[6]).readOnly = false;

		cells[3].getElementsByTagName('textarea')[0].readOnly = false;
		cells[4].getElementsByTagName('textarea')[0].readOnly = false;

		this.setEditCompetenceNotes();
		this.activateButtons();

	}

	this.setRateTrain = function(row)
	{
		var cells = row.cells;

		cells[6].className += ' field-activated';
		_getControl(cells[6]).readOnly = false;
	}

	this.setEditRatings = function()
	{
		_fieldRatingTasks.className   += ' field-activated';
		_fieldRatingCompets.className += ' field-activated';
		_fieldRatingTotal.className   += ' field-activated';
	}

	this.setEditMngComments = function()
	{
		var rows = _comments.rows;

		rows[1].cells[0].className += ' field-activated';
		rows[3].cells[0].className += ' field-activated';
		rows[4].cells[0].className += ' field-activated';
		rows[6].cells[0].className += ' field-activated';

		_getControl(rows[1].cells[0]).readOnly = false;
		_getControl(rows[4].cells[0]).readOnly = false;
		_getControl(rows[6].cells[0]).readOnly = false;

		var flags = rows[3].cells[0].getElementsByTagName('input');
		for (var i = 0; i < flags.length; i++) {
			flags[i].disabled = false;
		}
	}

	this.setEditEmpComments = function()
	{
		var cell = _emp_comment.rows[1].cells[0];

		cell.className += ' field-activated';
		_getControl(cell).readOnly = false;
	}

	// ��������� �������-����������� ������� � ������-���� � ��������
	this.setEditNotes = function()
	{
		var rows = _tasks.rows;
		var div = null;
		for (var i = 0; i < rows.length; i++) {
			div = rows[i].cells[4].getElementsByTagName('div')[0];
			if (div) {
				div.style.display = 'block';
			}
		}
	}

	this.setEditPersonalNotes = function()
	{
		var rows = _personaltasks.rows;
		var div = null;
		for (var i = 0; i < rows.length; i++) {
			div = rows[i].cells[4].getElementsByTagName('div')[0];
			if (div) {
				div.style.display = 'block';
			}
		}

		if (_managertasks != null)
		{
			var mrows = _managertasks.rows;
			var mdiv = null;
			for (var i = 0; i < mrows.length; i++) {
				mdiv = mrows[i].cells[4].getElementsByTagName('div')[0];
				if (mdiv) {
					mdiv.style.display = 'block';
				}
			}
		}

		var compNote = document.getElementById('competencePersonalNote');
		if (compNote)
			compNote.style.display = 'block';

		var trainNote = document.getElementById('trainingPersonalNote');
		if (trainNote)
			trainNote.style.display = 'block';

	}

	this.setEditFuncNotes = function()
	{
		var rows = _func_tasks.rows;
		var div = null;
		for (var i = 0; i < rows.length; i++) {
			div = rows[i].cells[4].getElementsByTagName('div')[0];
			if (div) {
				div.style.display = 'block';
			}
		}
	}

	this.setEditCompetenceNotes = function()
	{
		var rowsSt = _standsCompets.rows;
		if (rowsSt.length)
			for (var i = 0; i < rowsSt.length; i++)
			{
				div = rowsSt[i].cells[3].getElementsByTagName('div')[0];
				div.style.display = 'block';
			}

		if(_additsCompets)
		{
			var rowsAdd = _additsCompets.rows;
			if (rowsAdd.length)
				for (var i = 0; i < rowsAdd.length; i++)
				{
					div = rowsAdd[i].cells[3].getElementsByTagName('div')[0];
					div.style.display = 'block';
				}
		}
	}

	this.setEditPersonalCompetenceNotes = function()
	{
		var rowsSt  = _personalStandsCompets.rows;
		if (rowsSt.length)
			for (var i = 0; i < rowsSt.length; i++)
			{
				div = rowsSt[i].cells[2].getElementsByTagName('div')[0];
				div.style.display = 'block';
			}

		if(_personalAdditsCompets)
		{
			var rowsAdd = _personalAdditsCompets.rows;
			if (rowsAdd.length)
				for (var i = 0; i < rowsAdd.length; i++)
				{
					div = rowsAdd[i].cells[2].getElementsByTagName('div')[0];
					div.style.display = 'block';
				}
		}
	}

	this.activateButtons = function()
	{
		_buttonAddTask.onclick = Card.saveTasks; //Card.addTask;
		_buttonAddTraining.onclick = Card.addTrain;

		_buttonAddTask.className += ' button-activated';
		_buttonAddTraining.className += ' button-activated';
	}

	this.setModePlan = function()
	{

		var rows = _tasks.rows;
		for (var i = 0; i < rows.length; i++) {
			this.setPlanTask(rows[i]);
		}

		rows = _standsCompets.rows;
		for (var i = 0; i < rows.length; i++) {
			this.setPlanCompet(rows[i]);
		}

		if(_additsCompets)
		{
			rows = _additsCompets.rows;
			for (var i = 0; i < rows.length; i++) {
				this.setPlanCompet(rows[i]);
			}
		}

		rows = _trains.rows;
		for (var i = 0; i < rows.length; i++) {
			this.setPlanTrain(rows[i]);
		}


		this.setEditMngComments();
		this.activateButtons();

		if (count_func > 0) this.setEditRatio();
	}

	// ���� ������������ ��� ������������ ����� ����������
	this.setModePersonalPlan = function()
	{
		var rows = _personaltasks.rows;

		for (var i = 0; i < rows.length; i++) {
			this.setPlanTaskPersonal(rows[i]);
		}

		if(_managertasks != null)
		{
			var rows = _managertasks.rows;

			for (var i = 0; i < rows.length; i++) {
				this.setPlanTask2(rows[i]);
			}
		}

		var rows = _personalCompetence.rows;
		rows[1].cells[1].className += ' field-activated';
		_getControl(rows[1].cells[1]).readOnly = false;

		var rows = _personalTraining.rows;
		rows[1].cells[1].className += ' field-activated';
		_getControl(rows[1].cells[1]).readOnly = false;

		var rows = _personalStandsCompets.rows;
		for (var i = 0; i < rows.length; i++) {
			this.setPlanTask3(rows[i]);
		}

		if(_personalAdditsCompets != null)
		{
			var rows = _personalAdditsCompets.rows;
			for (var i = 0; i < rows.length; i++) {
				this.setPlanTask3(rows[i]);
			}
		}

		this.setEditPersonalCompetenceNotes();

		_buttonAddPersonalTask.onclick = Card.savePersonalTasks;
		_buttonAddPersonalTask.className += ' button-activated';


	}

	this.setEditRatio = function()
	{


		ratio_mng.style.display = 'block';
		ratio_fnc.style.display = 'block';

		lbl_mng.innerHTML = '';
		lbl_fnc.innerHTML = '';

	}

	this.setModePlanFuncMng = function()
	{

		var rows = _func_tasks.rows;
		for (var i = 0; i < rows.length; i++) {
			this.setPlanTask(rows[i]);
		}

		// �����������
		_func_comment.style.display = 'block';
		_func_div.style.display = 'none';


		// ������ ��������
		_buttonAddTask.onclick = Card.saveFunctionalTasks; //Card.addFuncTask;
		_buttonAddTask.className += ' button-activated';

	}

	this.setModeRate = function()
	{
		var rows = _tasks.rows;
		for (var i = 0; i < rows.length; i++) {
			this.setRateTask(rows[i]);
		}

		rows = _standsCompets.rows;
		for (var i = 0; i < rows.length; i++) {
			this.setRateCompet(rows[i]);
		}

		if(_additsCompets)
		{
			rows = _additsCompets.rows;
			for (var i = 0; i < rows.length; i++) {
				this.setRateCompet(rows[i]);
			}
		}

		rows = _trains.rows;
		for (var i = 0; i < rows.length; i++) {
			this.setRateTrain(rows[i]);
		}

		this.setEditRatings();
		this.setEditMngComments();
	}


	this.setModeRateFuncMng = function()
	{
		var rows = _func_tasks.rows;

		for (var i = 0; i < rows.length; i++) {
			this.setRateTask(rows[i]);
		}

		_fieldRatingFunc.className   += ' field-activated';

		_func_comment.style.display = 'block';
		_func_div.style.display = 'none';

	}

	this.setModeRatePersonal = function()
	{
		var rows = _personaltasks.rows;
		for (var i = 0; i < rows.length; i++) {
			this.setRateTask(rows[i]);
		}

		var mrows = _managertasks.rows;
		for (var i = 0; i < mrows.length; i++) {
			this.setRateTask(mrows[i]);
		}

		var rows = _personalStandsCompets.rows;
		for (var i = 0; i < rows.length; i++) {
			this.setRateTask2(rows[i]);
		}

		if(_personalAdditsCompets != null)
		{
			var rows = _personalAdditsCompets.rows;
			for (var i = 0; i < rows.length; i++) {
				this.setRateTask2(rows[i]);
			}
		}

		var rows = _personalCompetence.rows;
		rows[1].cells[1].className += ' field-activated';
		_getControl(rows[1].cells[1]).readOnly = false;

		// ������� Select Box ��� �����������
		var cmp_rtg_form = document.getElementById('cmp_rtg_form');
		cmp_rtg_form.style.display = 'block';

		// ������ Div � �������
		var cmp_rtg = document.getElementById('cmp_rtg');
		cmp_rtg.style.display = 'none';

		var rows = _personalTraining.rows;
		rows[1].cells[1].className += ' field-activated';
		_getControl(rows[1].cells[1]).readOnly = false;


		this.setEditPersonalCompetenceNotes();


	}

	this.checkSumWeights = function(table) {
		var rows = table.rows;
		var cells = null;
		var status = null;
		var sum = 0;
		var value = 0;
		for (var i = 0; i < rows.length-1; i++)
		{
			cells = rows[i].cells;
			status = _getControl(cells[0]).value;
			value = parseInt(_getControl(cells[3]).value, 10);
			if (status != '0')  sum += value;
		}
		if (sum == 100) return true;
		return false;
	}

	this.checkWeightValue = function(value)
	{
		if (isNaN(value)) return 0;
		if (value > 100) return 1;
		if (value < 0) return -1;
	}

	this.checkRatio = function()
	{
		var mng = parseInt(ratio_mng.value, 10);
		var fnc = parseInt(ratio_fnc.value, 10);

		if ((this.checkWeightValue(mng) == 0) || (this.checkWeightValue(fnc) == 0)) {
				alert('����������� ���� ������ ���� ����� ������!\nWeight ratio shall be a whole number!');
				return false;
		}
		if ((this.checkWeightValue(mng) > 0) || (this.checkWeightValue(fnc) > 0)) {
				alert('����������� ���� �� ����� ���� ������ 100!\nWeight ratio cannot be more than 100%!');
				return false;
		}
		if ((this.checkWeightValue(mng) < 0) || (this.checkWeightValue(fnc) < 0)) {
				alert('����������� ���� �� ����� ���� ������ 0!\nWeight ratio cannot be less than 0%!');
				return false;
		}
		ratio_mng.value = Math.round(mng, 10);
		ratio_fnc.value = Math.round(fnc, 10);

		return true;
	}

	this.checkSetPlan = function(count_func)
	{
		var msg = [];
		var emsg = [];

		if (!checkAllWeights) return false;
		// �� ��������� ���������� ����� � ������ ������� = 1 - �������
		if (_tasks.rows.length == 1){
			msg.push('- �� ��������� ������-����!');
			emsg.push('- Business objectives are not added!!');
		}

		if (!this.checkSumWeights(_tasks)){
			msg.push('- ����� ����� ������-����� ������ ���������� 100%! ������������ ����!');
			emsg.push('- Total weight of business objectives shall amount to 100%! Count over the weights!');
		}

		if (_tasks)
		{
			var count = Card.countActiveObjectivesByStatus(_tasks);

			// �������� �� ��, ��� �������� ���� �� ������ ����� ��� = 0. ���� �� �������
//			var notZero = Card.checkZeroInActiveObjectivesByStatus(_tasks);

			if (count > 7)
			{
				msg.push('- ����������� �� ���������� ����� �� ����� 6 �����!');
				emsg.push('- There is a limit of 6 active objectives!');
			}
			if (Card.checkCorrectDateTerm(_tasks) < 0)
			{
				msg.push('- ��������� <����> ���������� ���� ������-�����!');
				emsg.push('- Fill <Timing> for all objectives!');
			}

			// �������� �� ��, ��� �������� ���� �� ������ ����� ��� = 0. ���� �� �������
//			if(notZero == false) {
//				msg.push('- ��� ���� �� ����� ���� ����� ����! ������������ ����������� �����!');
//				emsg.push('- Weight must be more than 0! Count over the ratio of weights!');
//			}

		}


		if (count_func > 0)
		{

			if (_func_tasks.rows.length == 1){
				msg.push('- �� ��������� �������������� ������-����!');
				emsg.push('- Functional business objectives are not added!');
			}

			var total_ratio = parseInt(ratio_mng.value, 10) + parseInt(ratio_fnc.value, 10);
			this.checkRatio();

			if (total_ratio != '100') {
				msg.push('- ����� ����������� ����� ������ ���������� 100! ������������ ����������� �����!');
				emsg.push('- Total ratio of weights shall amount 100! Count over the ratio of weights!');
			}


			if (!this.checkSumWeights(_func_tasks) && count_func > 0){
				msg.push('- ����� ����� �������������� ������-����� ������ ���������� 100%! ������������ ����!');
				emsg.push('- Total weight of functional business objectives shall amount to 100%! Count over the weights!');
			}

			if (_func_tasks)
			{
				var count = Card.countActiveObjectivesByStatus(_func_tasks);
				if (count > 7)
				{
					msg.push('- ����������� �� ���������� ����� �� ����� 6 �����!');
					emsg.push('- There is a limit of 6 active objectives!');
				}
				if (Card.checkCorrectDateTerm(_func_tasks) < 0)
				{
					msg.push('- ��������� <����> ���������� ���� �������������� ������-�����!');
					emsg.push('- Fill <Timing> for all functional objectives!');
				}
			}


		}

		if (msg.length > 0) {
			msg = '���������� ����������� ����:' + "\n" + msg.join("\n");
			emsg = '\n\nImpossible to confirm a plan:' + "\n" + emsg.join("\n");
			alert(msg + emsg);
			return false;
		}
		return true;
	}

	this.checkSetRatings = function(count_func)
	{
		var msg = [];
		var emsg = [];

		var select = null;
		var rows = _tasks.rows;
		var row_comment = _comments.rows;
		var cells = null;
		var status = null;
		for (var i = 0; i < rows.length; i++) {
			cells = rows[i].cells;
			status = _getControl(cells[0]).value;

			if (status == '1') {
				if (_getControl(cells[5]).value.length < 2)	{
					msg.push('- �� ��������� ����������� � ������-�����!');
					emsg.push('- Comments to business objectives are not added!');
					break;
				}
				select = _getControl(cells[6]);
				if (select.options[select.selectedIndex].value == '') {
					msg.push('- �� ���������� �������� ������-�����!');
					emsg.push('- Business objectives ratings are not set out!');
					break;
				}
			}

		}
		if (count_func > 0)
		{
			var select = null;
			var rows = _func_tasks.rows;
			var cells = null;
			var status = null;
			for (var i = 0; i < rows.length; i++) {
				cells = rows[i].cells;
				status = _getControl(cells[0]).value;

				if (status == '1') {
					if (_getControl(cells[5]).value.length < 2)	{
						msg.push('- �� ��������� ����������� � �������������� ������-�����!');
						emsg.push('- Comments to functional business objectives are not added!');
						break;
					}
					select = _getControl(cells[6]);
					if (select.options[select.selectedIndex].value == '') {
						msg.push('- �� ���������� �������� �������������� ������-�����!');
						emsg.push('- Functional business objectives ratings are not set out!');
						break;
					}
				}

			}
		}

		rows = _standsCompets.rows;
		for (var i = 0; i < rows.length; i++) {
			cells = rows[i].cells;
			if (_getControl(cells[4]).value.length < 2)	{
				if(_additsCompets)
				{
					msg.push('- �� ��������� ����������� � ������������� ������������!');
					emsg.push('- Comments to corporate competences are not added!');
				}
				else
				{
					msg.push('- �� ��������� ����������� � ������������!');
					emsg.push('- Comments to competences are not added!');
				}
				break;
			}
			select = _getControl(cells[5]);
			if (select.options[select.selectedIndex].value == '') {
				if(_additsCompets)
				{
					msg.push('- �� ���������� �������� ������������� �����������!');
					emsg.push('- Corporate competences ratings are not set out!');
				}
				else
				{
					msg.push('- �� ���������� �������� �����������!');
					emsg.push('- Competences ratings are not set out!');
				}
				break;
			}
		}

		if(_additsCompets)
		{
			rows = _additsCompets.rows;
			for (var i = 0; i < rows.length; i++) {
				cells = rows[i].cells;
				if (_getControl(cells[4]).value.length < 2)	{
					msg.push('- �� ��������� ����������� � ������������ ������ ����������!');
					emsg.push('- Comments to job families competences are not added!');
					break;
				}
				select = _getControl(cells[5]);
				if (select.options[select.selectedIndex].value == '') {
					msg.push('- �� ���������� �������� ����������� ����� ����������!');
					emsg.push('- Job families competences ratings are not set out!');
					break;
				}
			}
		}

		rows = _trains.rows;
		for (var i = 0; i < rows.length - 1; i++) {
			cells = rows[i].cells;
			if (_getControl(cells[6]).value.length < 2)	{
				msg.push('- �� ��������� ����������� � ����� ����� ��������!');
				emsg.push('- Comments to plan development objectives are not added!');
				break;
			}
		}

		select = _getControl(_fieldRatingTasks);
		if (select.options[select.selectedIndex].value == '') {
			msg.push('- �� ��������� �������� ������� ������-�����!');
			emsg.push('- Total rating of business objective is not set out!');
		}
		select = _getControl(_fieldRatingCompets);
		if (select.options[select.selectedIndex].value == '') {
			msg.push('- �� ��������� �������� ������� �����������!');
			emsg.push('- Total rating of competences is not set out!');
		}
		select = _getControl(_fieldRatingTotal);
		if (select.options[select.selectedIndex].value == '') {
			msg.push('- �� ��������� ����� �������!');
			emsg.push('- Common rating is not set out!');
		}


		if (!_getControl(row_comment[1].cells[0]).value)
		{
			msg.push('- �� ��������� ����������� ������������!');
			emsg.push('- Manager comment is not set out!');
		}
		if (!_getControl(row_comment[4].cells[0]).value)
		{
			msg.push('- �� ��������� ������������ �� �������� �������!');
			emsg.push('- Career Development Recommendations are not set out!');
		}
		if (!_getControl(row_comment[6].cells[0]).value)
		{
			msg.push('- �� ��������� ��������� �������� ����������!');
			emsg.push('- Employee�s Career Expectations are not set out!');
		}


		if (msg.length > 0) {
			msg = '���������� ����������� ������:' + "\n" + msg.join("\n");
			emsg = '\n\nImpossible to confirm the rating:' + "\n" + emsg.join("\n");
			alert(msg + emsg);
			return false;
		}
		return true;
	}

	this.checkWeights = function(table) {			// ��������� ������������ ��������� �����
		var rows = table.rows;
		var len = rows.length - 1;
		var cells = null;
		var status = null;
		var weight = null;
		for (var i = 0; i < len; i++)
		{
			cells = rows[i].cells;
			status = _getControl(cells[0]).value;

			if (status == '0') continue;			// ���� ������-���� ���������, �� �� �� �������������

			weight = parseInt(_getControl(cells[3]).value, 10);

			if (this.checkWeightValue(weight) == 0) {
				alert('��� ���� ������ ���� ����� ������!\nWeight of objective shall be a whole number!');
				return false;
			}

			if (this.checkWeightValue(weight) > 0) {
				alert('��� ���� �� ����� ���� ������ 100%!\nWeight of objective cannot be more than 100%!');
				return false;
			}
			if (this.checkWeightValue(weight) < 0) {
				alert('��� ���� �� ����� ���� ������ 0%!\nWeight of objective cannot be less than 0%!');
				return false;
			}
			_getControl(cells[3]).value = Math.round(weight, 10);
		}

		return true;
	}

	this.checkWeightValue = function(value)
	{
		if (isNaN(value)) return 0;
		if (value > 100) return 1;
		if (value < 0) return -1;
	}

	this.checkRatio = function()
	{
		var mng = parseInt(ratio_mng.value, 10);
		var fnc = parseInt(ratio_fnc.value, 10);

		if ((this.checkWeightValue(mng) == 0) || (this.checkWeightValue(fnc) == 0)) {
				alert('����������� ���� ������ ���� ����� ������!\nWeight ratio shall be a whole number!');
				return false;
		}
		if ((this.checkWeightValue(mng) > 0) || (this.checkWeightValue(fnc) > 0)) {
				alert('����������� ���� �� ����� ���� ������ 100!\nWeight ratio cannot be more than 100%!');
				return false;
		}
		if ((this.checkWeightValue(mng) < 0) || (this.checkWeightValue(mng) < 0)) {
				alert('����������� ���� �� ����� ���� ������ 0!\nWeight ratio cannot be less than 0%!');
				return false;
		}
		ratio_mng.value = Math.round(mng, 10);
		ratio_fnc.value = Math.round(fnc, 10);

		return true;
	}

	this.save = function()
	{
//		_removeLastRow(_tasks);
//		_removeLastRow(_func_tasks);
//		_removeLastRow(_trains);
		if (period > 2008)
		{
			if (_tasks)
			{
				var count = Card.countActiveObjectivesByStatus(_tasks);
				if (count > 7)
				{
					alert("��������! ����������� �� ���������� ����� �� ����� 6 �����!");
					return;
				}
				if (Card.checkCorrectDateTerm(_tasks) < 0)
				{
					alert("��������! ��������� <����> ���������� ���� ������-�����!");
					return;
				}
			}


			if (_func_tasks)
			{
				var count = Card.countActiveObjectivesByStatus(_func_tasks);
				if (count > 7)
				{
					alert("��������! ����������� �� ���������� ����� �� ����� 6 �����!");
					return;
				}
				if (Card.checkCorrectDateTerm(_func_tasks) < 0)
				{
					alert("��������! ��������� <����> ���������� ���� �������������� ������-�����!");
					return;
				}
			}
		}

		if (!(Card.checkWeights(_tasks))) return;

		if (_personaltasks)
			if (!(Card.checkWeights(_personaltasks))) return;

		if (count_func > 0)
		{
			if (!(Card.checkWeights(_func_tasks))) return;
			if (!(Card.checkRatio())) return;
		}
		document.forms.card.submit();
	}

	this.countActiveObjectivesByStatus = function (table)
	{
		var rows = table.rows;
		var status;
		var count = rows.length;

		for (var i = 0; i < rows.length; i++)
		{
			status = rows[i].cells[0].getElementsByTagName('input')[0];
			if (status.value == '0') count--;
		}

		return count;

	}

	this.checkZeroInActiveObjectivesByStatus = function (table)
	{
		var rows = table.rows;
		var status;
		//var count = rows.length;

		for (var i = 0; i < rows.length; i++)
		{
			status = rows[i].cells[0].getElementsByTagName('input')[0];
			weight = rows[i].cells[3].getElementsByTagName('textarea')[0];
			if (status.value != '0'){
				if(weight.value == '0') return false;
				if(weight.value == '') return false;
			}
		}

		return true;

	}

	// ��������� ��������� �� ���� ���� � ������ �����
	this.checkCorrectDateTerm = function (table)
	{
		var rows = table.rows;
		var term;
		var pattern;

		for (var i = 0; i < rows.length; i++)
		{
			term = rows[i].cells[2].getElementsByTagName('input')[0];
			pattern = rows[i].cells[2].getElementsByTagName('input')[1];
			if (pattern.name == 'taskPattern[date_term]') continue;
			if (term.value == '') return -1;
		}

		return 0;

	}

	this.saveTasks = function()
	{

		if (period > 2008)
		{
			var count = Card.countActiveObjectivesByStatus(_tasks);

			if (count > 6)
			{
				alert("��������! ����������� �� ���������� ����� �� ����� 6 �����! �� �� ������ �������� ����� ����!");
				return;
			}
			else
				Card.addTask();
		}
		else
			Card.addTask();
		//document.forms.card.submit();

	}

	// ��������� ������������ ���� �����������, ��������� �� ���������� - �� ������ 6 �����
	this.saveFunctionalTasks = function()
	{
		if (period > 2008)
		{
			var count = Card.countActiveObjectivesByStatus(_func_tasks);

			if (count > 6)
			{
				alert("��������! ����������� �� ���������� ����� �� ����� 6 �����! �� �� ������ �������� ����� ����!");
				return;
			}
			else
				Card.addFuncTask();
		}
		else
			Card.addFuncTask();
		//document.forms.card.submit();

	}


	// ��������� ������������ ���� �����������, ��������� �� ���������� - �� ������ 6 �����
	this.savePersonalTasks = function()
	{
		if (_personaltasks)
			if (!(Card.checkWeights(_personaltasks))) return;

		if (period > 2008)
		{
			var count = Card.countActiveObjectivesByStatus(_personaltasks);

			if (count > 6)
			{
				alert("��������! ����������� �� ���������� ����� �� ����� 6 �����! �� �� ������ �������� ����� ����!");
				return;
			}
			else
				Card.addPersonalTask();
		}
		else
		{

			Card.addPersonalTask();
		}

		//document.forms.card.submit();

	}

	this.checkBalanceTasks = function()
	{
		var index = _rtg_tasks.selectedIndex;
		var calculate = this.CalculateRating();
		if (calculate != _rtg_tasks.options[index].text)
		{
			var rows = _comments.rows;
			var msg;
			if (!_getControl(rows[1].cells[0]).value)
			{
				msg = "������������ ����������! �������� ������� ������-����� " + _rtg_tasks.options[index].text + " � ����������� ������� " + calculate + " �� ���������! ��� ���������� ��������������� ���� ����� � ���� \"����������� ������������\"!\n\nImpossible to confirm! Total rating of business objective " + _rtg_tasks.options[index].text + " and calculated rating " + calculate + " do not coincide! You have to add your arguments in the field \"Manager�s comment\"!" ;
				alert(msg);
				return false;
			}
			msg = "��������! �������� ������� ������-����� " + _rtg_tasks.options[index].text + " � ����������� ������� " + calculate + " �� ���������! �������������� ���� ����� � ���� \"����������� ������������\"!\n\nAttention! Total rating of business objective " + _rtg_tasks.options[index].text + " and calculated rating " + calculate + " do not coincide! Explain your choice in the field \"Manager�s comment\"! " ;
			alert(msg);
			return true;
		}
		return true;
	}

	this.checkBalanceCompetences = function()
	{
		var index = _rtg_competens.selectedIndex;
		var calculate = this.CalculateCompetences();
		if (calculate != _rtg_competens.options[index].text)
		{
			var rows = _comments.rows;
			var msg;
			if (!_getControl(rows[1].cells[0]).value)
			{
				msg = "������������ ����������! �������� ������� ����������� " + _rtg_competens.options[index].text + " � ����������� ������� " + calculate + " �� ���������! ��� ���������� ��������������� ���� ����� � ���� \"����������� ������������\"!\n\nImpossible to confirm! Total rating of competences " + _rtg_competens.options[index].text + " and calculated rating " + calculate + " do not coincide! You have to add your arguments in the field \"Manager�s comment\"! " ;
				alert(msg);
				return false;
			}
			msg = "��������! �������� ������� ����������� " + _rtg_competens.options[index].text + " � ����������� ������� " + calculate + " �� ���������! �������������� ���� ����� � ���� \"����������� ������������\"!\n\nAttention! Total rating of competences " + _rtg_competens.options[index].text + " and calculated rating " + calculate + " do not coincide! Explain your choice in the field \"Manager�s comment\"! " ;
			alert(msg);
			return true;
		}
		return true;
	}

	function checkAllWeights() {
		if (!(this.checkWeights(_tasks))) return false;
		if (!(this.checkWeights(_func_tasks))) return false;
		return true;
	}

	function _cloneLastRow(table)
	{
		var pattern = table.rows[table.rows.length - 1];
		var numCells = pattern.cells.length;
		var row = table.insertRow(-1);
		var cell = null;

		row.className = pattern.className;

		for (var i = 0; i < numCells; i++) {
			cell = row.insertCell(-1);
			cell.className = pattern.cells[i].className;
			cell.innerHTML = pattern.cells[i].innerHTML;
		}

		return pattern;
	}

	function _removeLastRow(table)
	{
		var row = table.rows[table.rows.length - 1];
		row.parentNode.removeChild(row);
	}

	function _ratingTasksOnchange()
	{
		_ratings.rows[0].cells[1].innerHTML = this.options[this.selectedIndex].text;
	}

	function _ratingCompetsOnchange()
	{
		_ratings.rows[0].cells[3].innerHTML = this.options[this.selectedIndex].text;
	}

	function _getControl(node)
	{
		var obj = node.firstChild;

		while (obj && !obj.name) {
			obj = obj.nextSibling;
		}
		return obj;
	}

	//------------------------------------------------------
	var _input = null;

	this.calendar = function()
	{
		_input = this;
		JsCalendar.open();
	}

	this.calendarHandler = function(time, year, month, day)
	{
		_input.value = day + '.' + (1 + month) + '.' + ('' + year).substr(2, 2);
		var input = _input.nextSibling;
		if (!input.name) {
			input = input.nextSibling;
		}
		input.value = year + '-' + (1 + month) + '-' + day;
	}
}