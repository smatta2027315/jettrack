const express = require('express');
const router = express.Router();
const db = require('../../models');
const auth = require('../../middleware/auth');

const readableRoles = ['Instructor', 'Cadet Leader', 'Cadet'];
const editableRoles = ['Instructor', 'Cadet Leader'];

function isIntegerScore(value) {
  return value === '' || value === null || value === undefined ||
    (Number.isInteger(Number(value)) && Number(value) >= 0);
}

function parseMileRun(value) {
  if (value === '' || value === null || value === undefined) return null;
  if (typeof value !== 'string') return NaN;

  const match = /^(\d{1,2}):([0-5]\d)$/.exec(value.trim());
  if (!match) return NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}

function formatMileRun(value) {
  if (value === null || value === undefined || value === '') return '';
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return '';
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

async function loadCadetRecords(cadetID) {
  const [cadet, fitness, serviceHours, awards, promotions] = await Promise.all([
    db.cadet.findByPk(cadetID, { attributes: ['rank'] }),
    db.fitnessscore.findOne({
      where: { cadetID },
      order: [['assessment_date', 'DESC'], ['FitnessScoreID', 'DESC']],
    }),
    db.servicehours.findAll({
      where: { cadetID },
      include: [{ model: db.event, as: 'event', required: true }],
      order: [['service_date', 'DESC'], ['servicehoursID', 'DESC']],
    }),
    db.award.findAll({
      where: { cadetID },
      order: [['date_awarded', 'DESC'], ['awardID', 'DESC']],
    }),
    db.promotion.findAll({
      where: { cadetID },
      order: [['promotion_date', 'DESC'], ['promotionID', 'DESC']],
    }),
  ]);

  return {
    cadetID,
    currentRank: cadet?.rank ?? '',
    fitness: {
      sitUps: fitness?.sit_ups ?? '',
      pushUps: fitness?.push_ups ?? '',
      mileTime: formatMileRun(fitness?.mile_run),
    },
    events: serviceHours.map((record) => ({
      servicehoursID: record.servicehoursID,
      eventID: record.eventID,
      event: record.event.event_name,
      hours: record.hours,
      date: record.service_date,
    })),
    awards: awards.map((record) => ({
      awardID: record.awardID,
      name: record.award_name,
      description: record.award_description,
      date: record.date_awarded,
    })),
    promotions: promotions.map((record) => ({
      promotionID: record.promotionID,
      rank: record.new_rank,
      date: record.promotion_date,
    })),
  };
}

router.use(auth);

router.get('/events', async (req, res) => {
  if (!['Instructor', 'Cadet Leader'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: You cannot manage unit events' });
  }

  try {
    const events = await db.event.findAll({
      attributes: ['eventID', 'event_name', 'event_date', 'location', 'description'],
      order: [['event_date', 'DESC'], ['event_name', 'ASC']],
    });
    return res.json(events);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/events', async (req, res) => {
  if (req.user.role !== 'Instructor') {
    return res.status(403).json({ error: 'Forbidden: Only instructors can create events' });
  }

  const { event_name, event_date, location, description } = req.body;
  if (
    typeof event_name !== 'string' || !event_name.trim() || event_name.trim().length > 50 ||
    !isValidDate(event_date) ||
    typeof location !== 'string' || !location.trim() || location.trim().length > 100 ||
    typeof description !== 'string' || !description.trim() || description.trim().length > 500
  ) {
    return res.status(400).json({ error: 'Event name, valid date, location, and description are required' });
  }

  try {
    const event = await db.event.create({
      event_name: event_name.trim(),
      event_date,
      location: location.trim(),
      description: description.trim(),
    });
    return res.status(201).json(event);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/service-hours', async (req, res) => {
  if (!['Instructor', 'Cadet Leader'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: You cannot award service hours' });
  }

  const { cadetIDs, eventID, hours, service_date } = req.body;
  const parsedEventID = Number(eventID);
  if (
    !Array.isArray(cadetIDs) || cadetIDs.length === 0 ||
    cadetIDs.some((id) => !Number.isSafeInteger(id) || id < 1) ||
    new Set(cadetIDs).size !== cadetIDs.length ||
    !Number.isSafeInteger(parsedEventID) || parsedEventID < 1 ||
    !Number.isInteger(Number(hours)) || Number(hours) < 1 ||
    (service_date !== undefined && !isValidDate(service_date))
  ) {
    return res.status(400).json({ error: 'Select cadets, an event, valid service hours, and an optional valid date' });
  }

  try {
    const [cadets, event] = await Promise.all([
      db.cadet.findAll({
        attributes: ['cadetID'],
        where: { cadetID: cadetIDs },
      }),
      db.event.findByPk(parsedEventID),
    ]);

    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (cadets.length !== cadetIDs.length) {
      return res.status(404).json({ error: 'One or more selected cadets were not found' });
    }

    const serviceHours = await db.sequelize.transaction(async (transaction) => (
      db.servicehours.bulkCreate(cadetIDs.map((cadetID) => ({
        cadetID,
        eventID: parsedEventID,
        hours: Number(hours),
        service_date: service_date || currentDate(),
      })), { transaction })
    ));

    return res.status(201).json(serviceHours);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:cadetID', async (req, res) => {
  if (!readableRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: You cannot view cadet records' });
  }

  const cadetID = Number(req.params.cadetID);
  if (!Number.isSafeInteger(cadetID) || cadetID < 1) {
    return res.status(400).json({ error: 'Invalid cadet ID' });
  }

  try {
    const cadet = await db.cadet.findByPk(cadetID, { attributes: ['cadetID', 'userID'] });
    if (!cadet || (req.user.role === 'Cadet' && cadet.userID !== req.user.id)) {
      return res.status(404).json({ error: 'Cadet not found' });
    }

    return res.json(await loadCadetRecords(cadetID));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:cadetID', async (req, res) => {
  if (!editableRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: Only instructors and cadet leaders can update records' });
  }

  const cadetID = Number(req.params.cadetID);
  if (!Number.isSafeInteger(cadetID) || cadetID < 1) {
    return res.status(400).json({ error: 'Invalid cadet ID' });
  }

  const { fitness, events, awards, promotions, currentRank } = req.body;
  const hasEditableData = fitness !== undefined || events !== undefined ||
    awards !== undefined || promotions !== undefined || currentRank !== undefined;
  if (!hasEditableData) {
    return res.status(400).json({ error: 'No cadet record data was provided' });
  }

  if (fitness !== undefined) {
    const mileRun = parseMileRun(fitness?.mileTime);
    if (
      !fitness || typeof fitness !== 'object' ||
      !isIntegerScore(fitness.sitUps) ||
      !isIntegerScore(fitness.pushUps) ||
      Number.isNaN(mileRun)
    ) {
      return res.status(400).json({ error: 'Invalid fitness score data' });
    }
  }

  if (events !== undefined && (
    !Array.isArray(events) ||
    events.some((item) =>
      !item || typeof item.event !== 'string' || !item.event.trim() ||
      item.event.trim().length > 50 ||
      !Number.isInteger(Number(item.hours)) || Number(item.hours) <= 0
    )
  )) {
    return res.status(400).json({ error: 'Invalid event or service hour data' });
  }

  if (awards !== undefined && (
    !Array.isArray(awards) ||
    awards.some((item) =>
      !item || typeof item.name !== 'string' || !item.name.trim() ||
      item.name.trim().length > 45 ||
      (item.description !== undefined && (
        typeof item.description !== 'string' || item.description.length > 500
      ))
    )
  )) {
    return res.status(400).json({ error: 'Invalid award data' });
  }

  if (promotions !== undefined && (
    !Array.isArray(promotions) ||
    promotions.some((item) =>
      !item || typeof item.rank !== 'string' || !item.rank.trim() ||
      item.rank.trim().length > 45
    )
  )) {
    return res.status(400).json({ error: 'Invalid promotion data' });
  }

  if (
    currentRank !== undefined &&
    (typeof currentRank !== 'string' || !currentRank.trim() || currentRank.trim().length > 45)
  ) {
    return res.status(400).json({ error: 'Invalid current rank' });
  }

  try {
    const cadet = await db.cadet.findByPk(cadetID);
    if (!cadet) return res.status(404).json({ error: 'Cadet not found' });

    await db.sequelize.transaction(async (transaction) => {
      if (currentRank !== undefined) {
        await cadet.update({ rank: currentRank.trim() }, { transaction });
      }

      if (fitness !== undefined) {
        const score = await db.fitnessscore.findOne({
          where: { cadetID },
          order: [['assessment_date', 'DESC'], ['FitnessScoreID', 'DESC']],
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        const mileRun = parseMileRun(fitness.mileTime);
        const parseScore = (value) => (
          value === '' || value === null || value === undefined ? null : Number(value)
        );
        const values = {
          sit_ups: parseScore(fitness.sitUps),
          push_ups: parseScore(fitness.pushUps),
          mile_run: mileRun,
          assessment_date: currentDate(),
        };

        if (score) {
          await score.update(values, { transaction });
        } else {
          await db.fitnessscore.create({ cadetID, ...values }, { transaction });
        }
      }

      if (events !== undefined) {
        const existingHours = await db.servicehours.findAll({
          where: { cadetID },
          include: [{ model: db.event, as: 'event', required: true }],
          transaction,
        });
        await db.servicehours.destroy({ where: { cadetID }, transaction });
        for (const item of events) {
          let event = await db.event.findOne({
            where: { event_name: item.event.trim() },
            transaction,
          });
          if (!event) {
            event = await db.event.create({
              event_name: item.event.trim(),
              event_date: currentDate(),
              location: 'Not specified',
              description: 'Recorded from Cadet Record Tracking',
            }, { transaction });
          }

          await db.servicehours.create({
            cadetID,
            eventID: event.eventID,
            hours: Number(item.hours),
            service_date: existingHours.find((record) =>
              record.event.event_name === item.event.trim() &&
              Number(record.hours) === Number(item.hours)
            )?.service_date || currentDate(),
          }, { transaction });
        }
      }

      if (awards !== undefined) {
        const existingAwards = await db.award.findAll({ where: { cadetID }, transaction });
        const lastAward = await db.award.findOne({
          attributes: ['awardID'],
          order: [['awardID', 'DESC']],
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        let nextAwardID = Number(lastAward?.awardID || 0) + 1;
        await db.award.destroy({ where: { cadetID }, transaction });
        if (awards.length > 0) {
          await db.award.bulkCreate(awards.map((item) => ({
            awardID: nextAwardID++,
            cadetID,
            award_name: item.name.trim(),
            award_description: item.description?.trim() || '',
            date_awarded: item.date || existingAwards.find((record) =>
              record.award_name === item.name.trim() &&
              record.award_description === (item.description?.trim() || '')
            )?.date_awarded || currentDate(),
          })), { transaction });
        }
      }

      if (promotions !== undefined) {
        const existingPromotions = await db.promotion.findAll({ where: { cadetID }, transaction });
        await db.promotion.destroy({ where: { cadetID }, transaction });
        if (promotions.length > 0) {
          await db.promotion.bulkCreate(promotions.map((item) => ({
            cadetID,
            new_rank: item.rank.trim(),
            promotion_date: item.date || existingPromotions.find((record) =>
              record.new_rank === item.rank.trim()
            )?.promotion_date || currentDate(),
          })), { transaction });
        }
      }
    });

    return res.json(await loadCadetRecords(cadetID));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
