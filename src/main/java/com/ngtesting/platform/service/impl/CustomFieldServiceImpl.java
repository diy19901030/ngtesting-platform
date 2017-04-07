package com.ngtesting.platform.service.impl;

import java.util.LinkedList;
import java.util.List;

import org.hibernate.criterion.DetachedCriteria;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ngtesting.platform.entity.SysCustomField;
import com.ngtesting.platform.entity.SysCustomField;
import com.ngtesting.platform.entity.SysOrg;
import com.ngtesting.platform.entity.SysUser;
import com.ngtesting.platform.service.AccountService;
import com.ngtesting.platform.service.CustomFieldService;
import com.ngtesting.platform.service.RelationOrgGroupUserService;
import com.ngtesting.platform.service.RelationProjectRoleUserService;
import com.ngtesting.platform.service.UserService;
import com.ngtesting.platform.util.BeanUtilEx;
import com.ngtesting.platform.util.StringUtil;
import com.ngtesting.platform.vo.CasePriorityVo;
import com.ngtesting.platform.vo.CustomFieldVo;
import com.ngtesting.platform.vo.CustomFieldVo;
import com.ngtesting.platform.vo.Page;
import com.ngtesting.platform.vo.UserVo;

@Service
public class CustomFieldServiceImpl extends BaseServiceImpl implements CustomFieldService {
	@Override
	public List<SysCustomField> list(Long orgId) {
        DetachedCriteria dc = DetachedCriteria.forClass(SysCustomField.class);
        
        dc.add(Restrictions.eq("orgId", orgId));
        dc.add(Restrictions.eq("disabled", Boolean.FALSE));
        dc.add(Restrictions.eq("deleted", Boolean.FALSE));
        
        dc.addOrder(Order.asc("displayOrder"));
        List ls = findAllByCriteria(dc);
		
		return ls;
	}
	@Override
	public List<CustomFieldVo> listVos(Long orgId) {
        List ls = list(orgId);
        
        List<CustomFieldVo> vos = genVos(ls);
		return vos;
	}

	@Override
	public SysCustomField save(CustomFieldVo vo, Long orgId) {
		if (vo == null) {
			return null;
		}
		
		SysCustomField po;
		if (vo.getId() != null) {
			po = (SysCustomField) get(SysCustomField.class, vo.getId());
		} else {
			po = new SysCustomField();
		}
		po.setOrgId(orgId);
		
		BeanUtilEx.copyProperties(po, vo);
		
		saveOrUpdate(po);
		return po;
	}

	@Override
	public boolean delete(Long id) {
		SysCustomField po = (SysCustomField) get(SysCustomField.class, id);
		po.setDeleted(true);
		saveOrUpdate(po);
		
		return true;
	}
    
	@Override
	public CustomFieldVo genVo(SysCustomField po) {
		if (po == null) {
			return null;
		}
		CustomFieldVo vo = new CustomFieldVo();
		BeanUtilEx.copyProperties(vo, po);
		
		return vo;
	}
	@Override
	public List<CustomFieldVo> genVos(List<SysCustomField> pos) {
        List<CustomFieldVo> vos = new LinkedList<CustomFieldVo>();

        for (SysCustomField po: pos) {
        	CustomFieldVo vo = genVo(po);
        	vos.add(vo);
        }
		return vos;
	}

}