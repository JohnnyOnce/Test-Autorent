# Test-Autorent

Данный API позволяет бронировать машины, получать информацию о доступности машины, стоимость аренды и отчет о занятости машины в определенный месяц.

Для запуска нужно
1. Установить POSTGRESQL
2. Создать базу данных test-autorent
3. Создать таблицы cars и book_history с помощью скрипта
CREATE TABLE IF NOT EXISTS public.cars
(
    id integer NOT NULL DEFAULT nextval('cars_id_seq'::regclass),
    brand character varying(50) COLLATE pg_catalog."default" NOT NULL,
    model character varying(50) COLLATE pg_catalog."default" NOT NULL,
    booked boolean NOT NULL DEFAULT false,
    CONSTRAINT cars_pkey PRIMARY KEY (id)
)
CREATE TABLE IF NOT EXISTS public.book_history
(
    id integer NOT NULL DEFAULT nextval('book_history_id_seq'::regclass),
    car_id integer NOT NULL DEFAULT nextval('book_history_car_id_seq'::regclass),
    from_date date NOT NULL,
    to_date date NOT NULL,
    CONSTRAINT book_history_pkey PRIMARY KEY (id),
    CONSTRAINT "car_id_FK" FOREIGN KEY (car_id)
        REFERENCES public.cars (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
4. Запустить скрипт
insert into cars(brand, model) values('Toyota', 'Camry')
insert into cars(brand, model) values('Honda', 'Civic')
insert into cars(brand, model) values('Audi', 'A6')
insert into cars(brand, model) values('Mercedes-Benz', 'A-Class')
insert into cars(brand, model) values('Kia', 'EV6')
insert into book_history(car_id, from_date, to_date) values(2, '1970-01-01T00:00:00.000Z', '1970-01-01T00:00:00.000Z');
insert into book_history(car_id, from_date, to_date) values(3, '1970-01-01T00:00:00.000Z', '1970-01-01T00:00:00.000Z');
insert into book_history(car_id, from_date, to_date) values(4, '1970-01-01T00:00:00.000Z', '1970-01-01T00:00:00.000Z');
insert into book_history(car_id, from_date, to_date) values(5, '1970-01-01T00:00:00.000Z', '1970-01-01T00:00:00.000Z');
insert into book_history(car_id, from_date, to_date) values(6, '1970-01-01T00:00:00.000Z', '1970-01-01T00:00:00.000Z');
5. Установить nodejs и npm
6. В корне папки запустить команду "npm install && node app"
7. Перейти в браузере localhost:3000/api-docs для просмотра api
