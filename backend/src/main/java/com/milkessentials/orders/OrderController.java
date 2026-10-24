package com.milkessentials.orders;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
@CrossOrigin(origins = "*", allowedHeaders = {"Content-Type", "Authorization"},
        methods = {org.springframework.web.bind.annotation.RequestMethod.POST,
                   org.springframework.web.bind.annotation.RequestMethod.OPTIONS})
public class OrderController {
    private final JdbcTemplate jdbc;
    private static final SecureRandom RANDOM = new SecureRandom();

    public OrderController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public record OrderLine(@jakarta.validation.constraints.NotNull @Min(1) Long productId,
                            @Min(1) @jakarta.validation.constraints.Max(100) int quantity) {}
    public record CheckoutRequest(
            @NotBlank @Size(max = 160) String fullName,
            @NotBlank @Pattern(regexp = "^[+0-9() .-]{7,20}$", message = "Enter a valid phone number") String phone,
            @Email @Size(max = 254) String email,
            @NotBlank @Size(max = 220) String addressLine1,
            @Size(max = 220) String addressLine2,
            @NotBlank @Size(max = 120) String area,
            @NotBlank @Size(max = 120) String city,
            @NotBlank @Size(max = 120) String state,
            @NotBlank @Size(max = 20) String postalCode,
            @Size(max = 500) String deliveryInstructions,
            @Size(max = 500) String customerNote,
            @NotEmpty @Size(max = 50) List<@Valid OrderLine> items) {}
    public record CheckoutResponse(String orderNumber, String status, BigDecimal subtotal,
                                   BigDecimal deliveryFee, BigDecimal totalAmount) {}

    @PostMapping
    @Transactional
    public CheckoutResponse create(@Valid @RequestBody CheckoutRequest request) {
        String phone = request.phone().trim();
        Long customerId;
        List<Map<String, Object>> existing = jdbc.queryForList(
                "SELECT id FROM customers WHERE phone = ? FOR UPDATE", phone);
        if (existing.isEmpty()) {
            jdbc.update("INSERT INTO customers (full_name, phone, email) VALUES (?, ?, ?)",
                    request.fullName().trim(), phone, blankToNull(request.email()));
            customerId = jdbc.queryForObject("SELECT id FROM customers WHERE phone = ?", Long.class, phone);
        } else {
            customerId = ((Number) existing.get(0).get("id")).longValue();
            jdbc.update("UPDATE customers SET full_name = ?, email = COALESCE(?, email) WHERE id = ?",
                    request.fullName().trim(), blankToNull(request.email()), customerId);
        }

        jdbc.update("""
                INSERT INTO customer_addresses
                (customer_id, label, recipient_name, recipient_phone, address_line1, address_line2,
                 area, city, state, postal_code, delivery_instructions, is_default)
                VALUES (?, 'Checkout', ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)
                """, customerId, request.fullName().trim(), phone, request.addressLine1().trim(),
                blankToNull(request.addressLine2()), request.area().trim(), request.city().trim(),
                request.state().trim(), request.postalCode().trim(), blankToNull(request.deliveryInstructions()));
        Long addressId = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Long.class);

        BigDecimal subtotal = BigDecimal.ZERO;
        record PricedLine(long id, String sku, String name, String unit, BigDecimal price, int quantity) {}
        java.util.ArrayList<PricedLine> lines = new java.util.ArrayList<>();
        java.util.HashSet<Long> seen = new java.util.HashSet<>();
        for (OrderLine line : request.items()) {
            if (!seen.add(line.productId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each product must appear only once in the basket.");
            }
            List<Map<String, Object>> rows = jdbc.queryForList(
                    "SELECT id, sku, name, unit, price, is_available, stock_quantity FROM products WHERE id = ? FOR UPDATE",
                    line.productId());
            if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A product in your basket no longer exists.");
            Map<String, Object> row = rows.get(0);
            if (!Boolean.TRUE.equals(row.get("is_available"))) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, row.get("name") + " is no longer available.");
            }
            Object stockValue = row.get("stock_quantity");
            if (stockValue != null && ((Number) stockValue).intValue() < line.quantity()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Not enough stock for " + row.get("name") + ". Please update your basket.");
            }
            BigDecimal price = (BigDecimal) row.get("price");
            subtotal = subtotal.add(price.multiply(BigDecimal.valueOf(line.quantity())));
            lines.add(new PricedLine(((Number) row.get("id")).longValue(), (String) row.get("sku"),
                    (String) row.get("name"), (String) row.get("unit"), price, line.quantity()));
        }

        BigDecimal deliveryFee = BigDecimal.ZERO;
        BigDecimal total = subtotal.add(deliveryFee);
        String orderNumber = newOrderNumber();
        jdbc.update("""
                INSERT INTO customer_orders
                (order_number, customer_id, address_id, status, subtotal, delivery_fee, discount_amount, total_amount, customer_note)
                VALUES (?, ?, ?, 'PENDING', ?, ?, 0.00, ?, ?)
                """, orderNumber, customerId, addressId, subtotal, deliveryFee, total, blankToNull(request.customerNote()));
        Long orderId = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Long.class);

        for (PricedLine line : lines) {
            jdbc.update("""
                    INSERT INTO order_items
                    (order_id, product_id, product_name_snapshot, sku_snapshot, unit_snapshot, unit_price, quantity, line_total)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, orderId, line.id(), line.name(), line.sku(), line.unit(), line.price(),
                    line.quantity(), line.price().multiply(BigDecimal.valueOf(line.quantity())));
            jdbc.update("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity IS NOT NULL",
                    line.quantity(), line.id());
        }
        return new CheckoutResponse(orderNumber, "PENDING", subtotal, deliveryFee, total);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static String newOrderNumber() {
        return "SR" + Long.toString(System.currentTimeMillis(), 36).toUpperCase(Locale.ROOT)
                + String.format(Locale.ROOT, "%04d", RANDOM.nextInt(10000));
    }
}