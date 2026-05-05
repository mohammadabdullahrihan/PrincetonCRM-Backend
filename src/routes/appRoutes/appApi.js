const express = require('express');
const { catchErrors } = require('../../handlers/errorHandlers');
const router = express.Router();

const appControllers = require('../../controllers/appControllers');
const { routesList } = require('../../models/utils');

const routerApp = (entity, controller) => {
  router.route(`/${entity}/create`).post(catchErrors(controller['create']));
  router.route(`/${entity}/read/:id`).get(catchErrors(controller['read']));
  router.route(`/${entity}/update/:id`).patch(catchErrors(controller['update']));
  router.route(`/${entity}/delete/:id`).delete(catchErrors(controller['delete']));
  router.route(`/${entity}/search`).get(catchErrors(controller['search']));
  router.route(`/${entity}/list`).get(catchErrors(controller['list']));
  router.route(`/${entity}/listAll`).get(catchErrors(controller['listAll']));
  router.route(`/${entity}/filter`).get(catchErrors(controller['filter']));
  router.route(`/${entity}/summary`).get(catchErrors(controller['summary']));

  if (entity === 'invoice' || entity === 'quote' || entity === 'payment') {
    router.route(`/${entity}/mail`).post(catchErrors(controller['mail']));
  }

  if (entity === 'quote') {
    router.route(`/${entity}/convert/:id`).get(catchErrors(controller['convert']));
  }
};

routesList.forEach(({ entity, controllerName }) => {
  const controller = appControllers[controllerName];
  routerApp(entity, controller);
});

// Alias routes: map frontend URL patterns to auto-generated controllers

// /api/client-universal/* → clientuniversalController
const clientUniversalController = appControllers['clientUniversalController'];
if (clientUniversalController) {
  router.route('/client-universal/list').get(catchErrors(clientUniversalController['list']));
  router.route('/client-universal/listAll').get(catchErrors(clientUniversalController['listAll']));
  router.route('/client-universal/search').get(catchErrors(clientUniversalController['search']));
  router.route('/client-universal/filter').get(catchErrors(clientUniversalController['filter']));
  router.route('/client-universal/summary').get(catchErrors(clientUniversalController['summary']));
  router.route('/client-universal/create').post(catchErrors(clientUniversalController['create']));
  router.route('/client-universal/read/:id').get(catchErrors(clientUniversalController['read']));
  router.route('/client-universal/update/:id').patch(catchErrors(clientUniversalController['update']));
  router.route('/client-universal/delete/:id').delete(catchErrors(clientUniversalController['delete']));
}

// /api/project/expense/* → projectexpenseController
const projectExpenseController = appControllers['projectExpenseController'];
if (projectExpenseController) {
  router.route('/project/expense/list').get(catchErrors(projectExpenseController['list']));
  router.route('/project/expense/listAll').get(catchErrors(projectExpenseController['listAll']));
  router.route('/project/expense/search').get(catchErrors(projectExpenseController['search']));
  router.route('/project/expense/filter').get(catchErrors(projectExpenseController['filter']));
  router.route('/project/expense/summary').get(catchErrors(projectExpenseController['summary']));
  router.route('/project/expense/create').post(catchErrors(projectExpenseController['create']));
  router.route('/project/expense/read/:id').get(catchErrors(projectExpenseController['read']));
  router.route('/project/expense/update/:id').patch(catchErrors(projectExpenseController['update']));
  router.route('/project/expense/delete/:id').delete(catchErrors(projectExpenseController['delete']));
}

// /api/project/income/* → projectincomeController
const projectIncomeController = appControllers['projectIncomeController'];
if (projectIncomeController) {
  router.route('/project/income/list').get(catchErrors(projectIncomeController['list']));
  router.route('/project/income/listAll').get(catchErrors(projectIncomeController['listAll']));
  router.route('/project/income/search').get(catchErrors(projectIncomeController['search']));
  router.route('/project/income/filter').get(catchErrors(projectIncomeController['filter']));
  router.route('/project/income/summary').get(catchErrors(projectIncomeController['summary']));
  router.route('/project/income/create').post(catchErrors(projectIncomeController['create']));
  router.route('/project/income/read/:id').get(catchErrors(projectIncomeController['read']));
  router.route('/project/income/update/:id').patch(catchErrors(projectIncomeController['update']));
  router.route('/project/income/delete/:id').delete(catchErrors(projectIncomeController['delete']));
}

// /api/calendar/events/* → calendareventController
const calendarEventController = appControllers['calendarEventController'];
if (calendarEventController) {
  router.route('/calendar/events/list').get(catchErrors(calendarEventController['list']));
  router.route('/calendar/events/listAll').get(catchErrors(calendarEventController['listAll']));
  router.route('/calendar/events/search').get(catchErrors(calendarEventController['search']));
  router.route('/calendar/events/filter').get(catchErrors(calendarEventController['filter']));
  router.route('/calendar/events/summary').get(catchErrors(calendarEventController['summary']));
  router.route('/calendar/events/create').post(catchErrors(calendarEventController['create']));
  router.route('/calendar/events/read/:id').get(catchErrors(calendarEventController['read']));
  router.route('/calendar/events/update/:id').patch(catchErrors(calendarEventController['update']));
  router.route('/calendar/events/delete/:id').delete(catchErrors(calendarEventController['delete']));
}

// /api/developer/* → developerController
const developerController = appControllers['developerController'];
if (developerController) {
  router.route('/developer/list').get(catchErrors(developerController['list']));
  router.route('/developer/listAll').get(catchErrors(developerController['listAll']));
  router.route('/developer/search').get(catchErrors(developerController['search']));
  router.route('/developer/filter').get(catchErrors(developerController['filter']));
  router.route('/developer/summary').get(catchErrors(developerController['summary']));
  router.route('/developer/create').post(catchErrors(developerController['create']));
  router.route('/developer/read/:id').get(catchErrors(developerController['read']));
  router.route('/developer/update/:id').patch(catchErrors(developerController['update']));
  router.route('/developer/delete/:id').delete(catchErrors(developerController['delete']));
}

// /api/client-universal/niche-ai/* → clientuniversalController (subCategory: niche-ai)
if (clientUniversalController) {
  router.route('/client-universal/niche-ai/list').get(catchErrors(clientUniversalController['list']));
  router.route('/client-universal/niche-ai/listAll').get(catchErrors(clientUniversalController['listAll']));
  router.route('/client-universal/niche-ai/search').get(catchErrors(clientUniversalController['search']));
  router.route('/client-universal/niche-ai/filter').get(catchErrors(clientUniversalController['filter']));
  router.route('/client-universal/niche-ai/summary').get(catchErrors(clientUniversalController['summary']));
  router.route('/client-universal/niche-ai/create').post(catchErrors(clientUniversalController['create']));
  router.route('/client-universal/niche-ai/read/:id').get(catchErrors(clientUniversalController['read']));
  router.route('/client-universal/niche-ai/update/:id').patch(catchErrors(clientUniversalController['update']));
  router.route('/client-universal/niche-ai/delete/:id').delete(catchErrors(clientUniversalController['delete']));
}

// /api/executive/* → executiveController
const executiveController = appControllers['executiveController'];
if (executiveController) {
  router.route('/executive/list').get(catchErrors(executiveController['list']));
  router.route('/executive/listAll').get(catchErrors(executiveController['listAll']));
  router.route('/executive/search').get(catchErrors(executiveController['search']));
  router.route('/executive/filter').get(catchErrors(executiveController['filter']));
  router.route('/executive/summary').get(catchErrors(executiveController['summary']));
  router.route('/executive/create').post(catchErrors(executiveController['create']));
  router.route('/executive/read/:id').get(catchErrors(executiveController['read']));
  router.route('/executive/update/:id').patch(catchErrors(executiveController['update']));
  router.route('/executive/delete/:id').delete(catchErrors(executiveController['delete']));
}

// include Property routes here
router.use(require('./propertyRoute'));

module.exports = router;
