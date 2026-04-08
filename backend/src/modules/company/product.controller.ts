import { FastifyRequest, FastifyReply } from 'fastify';
import { ProductRepository } from '../../repositories/ProductRepository';
import { NotificationController } from './notification.controller';
import { SequenceService } from './sequence.service';
import { NotFoundError } from '../../middleware/errorHandler';

export class ProductController {
  async getProducts(request: FastifyRequest, reply: FastifyReply) {
    const { id: companyId } = request.params as { id: string };
    const products = await ProductRepository.findMany({ companyId });
    return reply.send({ success: true, data: products });
  }

  async getProduct(request: FastifyRequest, reply: FastifyReply) {
    const { productId } = request.params as { productId: string };
    const product = await ProductRepository.findById(productId);
    if (!product) throw new NotFoundError('Product not found');
    return reply.send({ success: true, data: product });
  }

  async createProduct(request: FastifyRequest, reply: FastifyReply) {
    const { id: companyId } = request.params as { id: string };
    const { name, sku, description, unitPrice, isActive, isInventory, lowStockThreshold, openingStock } = request.body as any;

    const code = await SequenceService.generateDocumentNumber(companyId, 'product');

    const product = await ProductRepository.create({
      code,
      name,
      companyId,
      sku: sku || code,
      description,
      unitPrice: Number(unitPrice || 0),
      isActive: isActive !== undefined ? isActive : true,
      isInventory: isInventory !== undefined ? isInventory : true,
      lowStockThreshold: Number(lowStockThreshold || 0),
      openingStock: Number(openingStock || 0),
      quantityOnHand: Number(openingStock || 0)
    });

    await NotificationController.logActivity({
      companyId,
      entityType: 'product',
      entityId: product.id,
      action: 'CREATED',
      performedById: (request.user as any).id,
      metadata: { docNumber: code, name }
    });

    return reply.status(201).send({ success: true, data: product });
  }

  async updateProduct(request: FastifyRequest, reply: FastifyReply) {
    const { productId } = request.params as { productId: string };
    const { id: companyId } = request.params as { id: string };
    const data = request.body as any;

    const existing = await ProductRepository.findById(productId);
    if (!existing) throw new NotFoundError('Product not found');

    const product = await ProductRepository.update(productId, {
      ...data,
      unitPrice: data.unitPrice !== undefined ? Number(data.unitPrice) : undefined,
      lowStockThreshold: data.lowStockThreshold !== undefined ? Number(data.lowStockThreshold) : undefined,
      openingStock: data.openingStock !== undefined ? Number(data.openingStock) : undefined,
      isInventory: data.isInventory !== undefined ? data.isInventory : undefined
    });

    await NotificationController.logActivity({
      companyId,
      entityType: 'product',
      entityId: product.id,
      action: 'UPDATED',
      performedById: (request.user as any).id,
      metadata: { docNumber: product.code, name: product.name }
    });

    return reply.send({ success: true, data: product });
  }

  async deleteProduct(request: FastifyRequest, reply: FastifyReply) {
    const { productId } = request.params as { productId: string };
    const { id: companyId } = request.params as { id: string };

    const product = await ProductRepository.findById(productId);
    if (!product) throw new NotFoundError('Product not found');

    await ProductRepository.delete(productId);

    await NotificationController.logActivity({
      companyId,
      entityType: 'product',
      entityId: productId,
      action: 'DELETED',
      performedById: (request.user as any).id,
      metadata: { name: product.name }
    });

    return reply.send({ success: true, message: 'Product deleted' });
  }
}
