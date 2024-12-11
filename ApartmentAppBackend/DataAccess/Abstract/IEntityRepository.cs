using Entities.Abstract;
using Entities.Concrete;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Abstract
{
    //ÇOK ÖNEMLİ
    // ADD,LIST,UPDATE,DELETE İŞLEMLERİNİN TEMELİNİ GENERIC YAPI KULLANDIĞIMIZ IEntityRepository İLE GERÇEKLERİZ
   //GENERIC Constrait yazdık-- referans tip olmalı, Sadece veritabanı tablosuna karşılık gelen classlar olmalı
    public interface IEntityRepository<T> where T : class, IEntity,new()
    {
        List<T> GetAll(Expression<Func<T,bool>> filter=null);

        T Get();

        void Add(T entity);

        void Update(T entity);

        void Delete(T entity);

     

    }
}
